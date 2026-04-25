/**
 * Zenvora AI Platform - Enterprise SSO Authentication
 * Supports SAML, OAuth2, OpenID Connect, LDAP integration
 */

const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const OAuth2Strategy = require('passport-oauth2').Strategy;
const OpenIDConnectStrategy = require('passport-openidconnect');
const ldap = require('ldapjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class EnterpriseSSO {
    constructor(config) {
        this.config = {
            saml: config.saml || {},
            oauth2: config.oauth2 || {},
            oidc: config.oidc || {},
            ldap: config.ldap || {},
            jwtSecret: config.jwtSecret || process.env.JWT_SECRET,
            sessionSecret: config.sessionSecret || process.env.SESSION_SECRET
        };
        
        this.initializeStrategies();
    }

    initializeStrategies() {
        // SAML Strategy
        if (this.config.saml.enabled) {
            passport.use(new SamlStrategy({
                entryPoint: this.config.saml.entryPoint,
                issuer: this.config.saml.issuer,
                callbackUrl: this.config.saml.callbackUrl,
                cert: this.config.saml.cert,
                privateKey: this.config.saml.privateKey,
                decryptionPvk: this.config.saml.decryptionPvk,
            }, (profile, done) => {
                return this.handleSAMLLogin(profile, done);
            }));
        }

        // OAuth2 Strategy
        if (this.config.oauth2.enabled) {
            passport.use(new OAuth2Strategy({
                authorizationURL: this.config.oauth2.authorizationURL,
                tokenURL: this.config.oauth2.tokenURL,
                clientID: this.config.oauth2.clientID,
                clientSecret: this.config.oauth2.clientSecret,
                callbackURL: this.config.oauth2.callbackURL,
            }, (accessToken, refreshToken, profile, done) => {
                return this.handleOAuth2Login(accessToken, refreshToken, profile, done);
            }));
        }

        // OpenID Connect Strategy
        if (this.config.oidc.enabled) {
            passport.use(new OpenIDConnectStrategy({
                issuer: this.config.oidc.issuer,
                clientID: this.config.oidc.clientID,
                clientSecret: this.config.oidc.clientSecret,
                callbackURL: this.config.oidc.callbackURL,
                scope: 'openid profile email',
            }, (issuer, sub, profile, accessToken, refreshToken, done) => {
                    return this.handleOIDCLogin(issuer, sub, profile, accessToken, refreshToken, done);
                }));
        }
    }

    async handleSAMLLogin(profile, done) {
        try {
            const user = await this.findOrCreateUser({
                id: profile.nameID,
                email: profile['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                name: profile.displayName,
                provider: 'saml',
                attributes: profile.attributes
            });
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }

    async handleOAuth2Login(accessToken, refreshToken, profile, done) {
        try {
            const user = await this.findOrCreateUser({
                id: profile.id,
                email: profile.email,
                name: profile.displayName,
                provider: 'oauth2',
                accessToken,
                refreshToken,
                attributes: profile._json
            });
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }

    async handleOIDCLogin(issuer, sub, profile, accessToken, refreshToken, done) {
        try {
            const user = await this.findOrCreateUser({
                id: sub,
                email: profile.email,
                name: profile.name,
                provider: 'oidc',
                issuer,
                accessToken,
                refreshToken,
                attributes: profile
            });
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }

    async ldapAuthenticate(username, password) {
        if (!this.config.ldap.enabled) {
            throw new Error('LDAP not configured');
        }

        return new Promise((resolve, reject) => {
            const client = ldap.createClient({
                url: this.config.ldap.url,
                bindDN: this.config.ldap.bindDN,
                bindCredentials: this.config.ldap.bindCredentials,
                searchBase: this.config.ldap.searchBase,
                searchFilter: `(&(uid=${username})(objectClass=person))`,
                searchAttributes: ['uid', 'cn', 'mail', 'memberOf']
            });

            client.bind(this.config.ldap.bindDN, this.config.ldap.bindCredentials, (err) => {
                if (err) {
                    return reject(err);
                }

                const searchOpts = {
                    filter: `(&(uid=${username})(objectClass=person))`,
                    scope: 'sub',
                    attributes: ['uid', 'cn', 'mail', 'memberOf']
                };

                client.search(this.config.ldap.searchBase, searchOpts, (err, search) => {
                    if (err) {
                        client.unbind();
                        return reject(err);
                    }

                    let found = false;
                    search.on('searchEntry', (entry) => {
                        found = true;
                        const userDN = entry.objectName;
                        
                        // Verify password
                        client.bind(userDN, password, (err) => {
                            client.unbind();
                            if (err) {
                                return reject(new Error('Invalid credentials'));
                            }
                            
                            const user = {
                                id: entry.uid,
                                email: entry.mail,
                                name: entry.cn,
                                groups: entry.memberOf || [],
                                provider: 'ldap',
                                attributes: entry.object
                            };
                            
                            resolve(user);
                        });
                    });

                    search.on('end', () => {
                        if (!found) {
                            client.unbind();
                            reject(new Error('User not found'));
                        }
                    });

                    search.on('error', (err) => {
                        client.unbind();
                        reject(err);
                    });
                });
            });
        });
    }

    async findOrCreateUser(userData) {
        // This would typically interact with your database
        // For now, return a mock user
        return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            provider: userData.provider,
            roles: await this.getUserRoles(userData),
            permissions: await this.getUserPermissions(userData),
            attributes: userData.attributes || {},
            createdAt: new Date(),
            lastLogin: new Date()
        };
    }

    async getUserRoles(userData) {
        // Determine user roles based on LDAP groups, SAML attributes, or database
        const roles = ['user'];
        
        if (userData.attributes?.groups?.includes('admin')) {
            roles.push('admin');
        }
        
        if (userData.attributes?.groups?.includes('developer')) {
            roles.push('developer');
        }
        
        if (userData.attributes?.groups?.includes('manager')) {
            roles.push('manager');
        }
        
        return roles;
    }

    async getUserPermissions(userData) {
        const roles = await this.getUserRoles(userData);
        const permissions = new Set();
        
        // Base permissions for all users
        permissions.add('read:own_profile');
        permissions.add('read:own_projects');
        permissions.add('write:own_projects');
        
        // Role-based permissions
        if (roles.includes('developer')) {
            permissions.add('read:all_projects');
            permissions.add('write:code_analysis');
            permissions.add('read:analytics');
        }
        
        if (roles.includes('manager')) {
            permissions.add('read:team_projects');
            permissions.add('manage:team_members');
            permissions.add('read:team_analytics');
        }
        
        if (roles.includes('admin')) {
            permissions.add('read:all_users');
            permissions.add('write:all_users');
            permissions.add('read:all_projects');
            permissions.add('write:all_projects');
            permissions.add('manage:system_settings');
            permissions.add('read:system_analytics');
        }
        
        return Array.from(permissions);
    }

    generateJWT(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            roles: user.roles,
            permissions: user.permissions,
            provider: user.provider,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        return jwt.sign(payload, this.config.jwtSecret, { algorithm: 'HS256' });
    }

    verifyJWT(token) {
        try {
            return jwt.verify(token, this.config.jwtSecret, { algorithm: 'HS256' });
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Middleware for protecting routes
    authenticate(req, res, next) {
        passport.authenticate(['saml', 'oauth2', 'openidconnect'], (err, user, info) => {
            if (err || !user) {
                return res.status(401).json({ error: 'Authentication failed', message: info?.message });
            }
            
            req.user = user;
            next();
        })(req, res, next);
    }

    // Middleware for checking permissions
    requirePermission(permission) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            
            if (!req.user.permissions.includes(permission)) {
                return res.status(403).json({ error: 'Insufficient permissions' });
            }
            
            next();
        };
    }

    // Middleware for checking roles
    requireRole(role) {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            
            if (!req.user.roles.includes(role)) {
                return res.status(403).json({ error: 'Insufficient role' });
            }
            
            next();
        };
    }

    // Get authentication routes
    getRoutes() {
        const router = require('express').Router();

        // SAML routes
        if (this.config.saml.enabled) {
            router.get('/saml/login', passport.authenticate('saml', {
                failureRedirect: '/login',
                failureFlash: true
            }));

            router.post('/saml/callback', passport.authenticate('saml', {
                failureRedirect: '/login',
                failureFlash: true
            }), (req, res) => {
                const token = this.generateJWT(req.user);
                res.redirect(`/auth/callback?token=${token}`);
            });
        }

        // OAuth2 routes
        if (this.config.oauth2.enabled) {
            router.get('/oauth2/login', passport.authenticate('oauth2'));

            router.get('/oauth2/callback', passport.authenticate('oauth2', {
                failureRedirect: '/login',
                failureFlash: true
            }), (req, res) => {
                const token = this.generateJWT(req.user);
                res.redirect(`/auth/callback?token=${token}`);
            });
        }

        // OpenID Connect routes
        if (this.config.oidc.enabled) {
            router.get('/oidc/login', passport.authenticate('openidconnect'));

            router.get('/oidc/callback', passport.authenticate('openidconnect', {
                failureRedirect: '/login',
                failureFlash: true
            }), (req, res) => {
                const token = this.generateJWT(req.user);
                res.redirect(`/auth/callback?token=${token}`);
            });
        }

        // LDAP route
        router.post('/ldap/login', async (req, res) => {
            try {
                const { username, password } = req.body;
                
                if (!username || !password) {
                    return res.status(400).json({ error: 'Username and password required' });
                }
                
                const user = await this.ldapAuthenticate(username, password);
                const token = this.generateJWT(user);
                
                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        roles: user.roles,
                        permissions: user.permissions
                    }
                });
            } catch (error) {
                res.status(401).json({ error: 'Authentication failed', message: error.message });
            }
        });

        // Token validation
        router.post('/validate', (req, res) => {
            try {
                const { token } = req.body;
                const decoded = this.verifyJWT(token);
                res.json({ valid: true, user: decoded });
            } catch (error) {
                res.status(401).json({ valid: false, error: 'Invalid token' });
            }
        });

        // Refresh token
        router.post('/refresh', (req, res) => {
            try {
                const { token } = req.body;
                const decoded = this.verifyJWT(token);
                
                // Generate new token with updated expiration
                const newToken = this.generateJWT(decoded);
                res.json({ token: newToken });
            } catch (error) {
                res.status(401).json({ error: 'Invalid token' });
            }
        });

        return router;
    }
}

module.exports = EnterpriseSSO;
