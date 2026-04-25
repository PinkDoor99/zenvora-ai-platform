/**
 * Zenvora AI Platform - Role-Based Access Control (RBAC)
 * Enterprise-grade permission management system
 */

class RBAC {
    constructor() {
        this.roles = new Map();
        this.permissions = new Map();
        this.userRoles = new Map();
        this.rolePermissions = new Map();
        this.resourcePermissions = new Map();
        
        this.initializeDefaultRoles();
        this.initializeDefaultPermissions();
        this.assignDefaultPermissions();
    }

    initializeDefaultRoles() {
        const defaultRoles = [
            {
                id: 'super_admin',
                name: 'Super Administrator',
                description: 'Full system access',
                level: 100,
                isSystem: true
            },
            {
                id: 'admin',
                name: 'Administrator',
                description: 'Full administrative access',
                level: 90,
                isSystem: true
            },
            {
                id: 'manager',
                name: 'Manager',
                description: 'Team and project management',
                level: 70,
                isSystem: true
            },
            {
                id: 'developer',
                name: 'Developer',
                description: 'Development and coding access',
                level: 50,
                isSystem: true
            },
            {
                id: 'analyst',
                name: 'Analyst',
                description: 'Analytics and reporting access',
                level: 40,
                isSystem: true
            },
            {
                id: 'user',
                name: 'User',
                description: 'Basic user access',
                level: 20,
                isSystem: true
            },
            {
                id: 'guest',
                name: 'Guest',
                description: 'Limited read-only access',
                level: 10,
                isSystem: true
            }
        ];

        defaultRoles.forEach(role => {
            this.roles.set(role.id, role);
        });
    }

    initializeDefaultPermissions() {
        const defaultPermissions = [
            // User Management
            'users:read',
            'users:read_own',
            'users:write',
            'users:write_own',
            'users:delete',
            'users:delete_own',
            'users:manage_roles',
            'users:impersonate',

            // Project Management
            'projects:read',
            'projects:read_own',
            'projects:read_team',
            'projects:read_all',
            'projects:write',
            'projects:write_own',
            'projects:write_team',
            'projects:write_all',
            'projects:delete',
            'projects:delete_own',
            'projects:delete_team',
            'projects:delete_all',
            'projects:share',
            'projects:export',
            'projects:import',

            // Code Analysis
            'analysis:read',
            'analysis:read_own',
            'analysis:read_team',
            'analysis:read_all',
            'analysis:write',
            'analysis:write_own',
            'analysis:write_team',
            'analysis:write_all',
            'analysis:delete',
            'analysis:delete_own',
            'analysis:delete_team',
            'analysis:delete_all',
            'analysis:run',
            'analysis:run_advanced',
            'analysis:configure',

            // AI Tools
            'ai:generate_code',
            'ai:security_scan',
            'ai:performance_optimize',
            'ai:documentation_generate',
            'ai:code_review',
            'ai:refactor',
            'ai:debug_assist',
            'ai:chat_assistant',
            'ai:custom_prompts',
            'ai:advanced_models',

            // Learning System
            'lessons:read',
            'lessons:read_all',
            'lessons:write',
            'lessons:delete',
            'lessons:publish',
            'lessons:manage_curriculum',
            'lessons:track_progress',
            'lessons:certificates',
            'lessons:assessments',

            // Analytics & Reporting
            'analytics:read',
            'analytics:read_own',
            'analytics:read_team',
            'analytics:read_all',
            'analytics:export',
            'analytics:real_time',
            'analytics:custom_reports',
            'analytics:system_metrics',
            'analytics:user_behavior',
            'analytics:financial',

            // System Administration
            'system:read_settings',
            'system:write_settings',
            'system:manage_integrations',
            'system:manage_sso',
            'system:manage_ldap',
            'system:manage_oauth',
            'system:manage_backups',
            'system:monitor_logs',
            'system:security_audit',
            'system:performance_monitor',
            'system:database_admin',
            'system:api_management',

            // Collaboration
            'collaboration:read',
            'collaboration:write',
            'collaboration:manage_teams',
            'collaboration:invite_users',
            'collaboration:remove_users',
            'collaboration:real_time_edit',
            'collaboration:voice_call',
            'collaboration:video_call',
            'collaboration:screen_share',
            'collaboration:file_share',

            // Enterprise Features
            'enterprise:billing',
            'enterprise:subscriptions',
            'enterprise:usage_limits',
            'enterprise:compliance',
            'enterprise:audit_logs',
            'enterprise:data_retention',
            'enterprise:export_data',
            'enterprise:api_keys',
            'enterprise:webhooks',
            'enterprise:custom_domains',

            // Mobile App
            'mobile:access',
            'mobile:offline_mode',
            'mobile:push_notifications',
            'mobile:biometric_auth',
            'mobile:device_management',
            'mobile:remote_wipe',

            // API Access
            'api:read',
            'api:write',
            'api:delete',
            'api:admin',
            'api:keys_manage',
            'api:rate_limits',
            'api:webhooks',
            'api:integrations'
        ];

        defaultPermissions.forEach(permission => {
            this.permissions.set(permission, {
                id: permission,
                name: this.formatPermissionName(permission),
                description: this.generatePermissionDescription(permission),
                category: this.getPermissionCategory(permission)
            });
        });
    }

    assignDefaultPermissions() {
        // Guest role - read-only access
        this.assignRolePermissions('guest', [
            'projects:read',
            'lessons:read',
            'analytics:read_own'
        ]);

        // User role - basic user access
        this.assignRolePermissions('user', [
            'users:read_own',
            'users:write_own',
            'projects:read_own',
            'projects:write_own',
            'projects:delete_own',
            'projects:share',
            'analysis:read_own',
            'analysis:write_own',
            'analysis:run',
            'ai:generate_code',
            'ai:security_scan',
            'ai:performance_optimize',
            'ai:documentation_generate',
            'lessons:read',
            'lessons:track_progress',
            'lessons:certificates',
            'analytics:read_own',
            'collaboration:read',
            'collaboration:write',
            'collaboration:real_time_edit',
            'mobile:access',
            'mobile:offline_mode',
            'mobile:biometric_auth',
            'api:read',
            'api:write'
        ]);

        // Analyst role - analytics focused
        this.assignRolePermissions('analyst', [
            'users:read_own',
            'users:write_own',
            'projects:read_team',
            'projects:read_all',
            'analysis:read_team',
            'analysis:read_all',
            'analysis:run_advanced',
            'lessons:read_all',
            'lessons:track_progress',
            'analytics:read_team',
            'analytics:read_all',
            'analytics:export',
            'analytics:custom_reports',
            'analytics:user_behavior',
            'collaboration:read',
            'collaboration:write',
            'collaboration:manage_teams',
            'api:read',
            'api:write',
            'api:delete'
        ]);

        // Developer role - development focused
        this.assignRolePermissions('developer', [
            'users:read_own',
            'users:write_own',
            'projects:read_team',
            'projects:write_team',
            'projects:delete_team',
            'projects:export',
            'projects:import',
            'analysis:read_team',
            'analysis:write_team',
            'analysis:delete_team',
            'analysis:run_advanced',
            'analysis:configure',
            'ai:generate_code',
            'ai:security_scan',
            'ai:performance_optimize',
            'ai:documentation_generate',
            'ai:code_review',
            'ai:refactor',
            'ai:debug_assist',
            'ai:chat_assistant',
            'ai:custom_prompts',
            'lessons:read_all',
            'lessons:write',
            'lessons:publish',
            'lessons:assessments',
            'analytics:read_team',
            'analytics:export',
            'collaboration:read',
            'collaboration:write',
            'collaboration:manage_teams',
            'collaboration:real_time_edit',
            'collaboration:voice_call',
            'collaboration:screen_share',
            'collaboration:file_share',
            'mobile:access',
            'mobile:offline_mode',
            'mobile:push_notifications',
            'mobile:biometric_auth',
            'api:read',
            'api:write',
            'api:delete',
            'api:keys_manage',
            'api:webhooks'
        ]);

        // Manager role - team management
        this.assignRolePermissions('manager', [
            'users:read',
            'users:write',
            'users:manage_roles',
            'projects:read_team',
            'projects:write_team',
            'projects:delete_team',
            'projects:share',
            'projects:export',
            'analysis:read_team',
            'analysis:write_team',
            'analysis:run_advanced',
            'ai:generate_code',
            'ai:security_scan',
            'ai:performance_optimize',
            'ai:documentation_generate',
            'ai:code_review',
            'lessons:read_all',
            'lessons:write',
            'lessons:publish',
            'lessons:track_progress',
            'lessons:certificates',
            'lessons:assessments',
            'analytics:read_team',
            'analytics:export',
            'analytics:custom_reports',
            'analytics:user_behavior',
            'collaboration:read',
            'collaboration:write',
            'collaboration:manage_teams',
            'collaboration:invite_users',
            'collaboration:remove_users',
            'collaboration:real_time_edit',
            'collaboration:voice_call',
            'collaboration:video_call',
            'collaboration:screen_share',
            'collaboration:file_share',
            'enterprise:billing',
            'enterprise:usage_limits',
            'enterprise:audit_logs',
            'mobile:access',
            'mobile:offline_mode',
            'mobile:push_notifications',
            'mobile:biometric_auth',
            'mobile:device_management',
            'api:read',
            'api:write',
            'api:delete',
            'api:keys_manage',
            'api:webhooks',
            'api:integrations'
        ]);

        // Admin role - full administrative access
        this.assignRolePermissions('admin', [
            'users:read',
            'users:write',
            'users:delete',
            'users:manage_roles',
            'users:impersonate',
            'projects:read_all',
            'projects:write_all',
            'projects:delete_all',
            'projects:export',
            'projects:import',
            'analysis:read_all',
            'analysis:write_all',
            'analysis:delete_all',
            'analysis:run_advanced',
            'analysis:configure',
            'ai:generate_code',
            'ai:security_scan',
            'ai:performance_optimize',
            'ai:documentation_generate',
            'ai:code_review',
            'ai:refactor',
            'ai:debug_assist',
            'ai:chat_assistant',
            'ai:custom_prompts',
            'ai:advanced_models',
            'lessons:read_all',
            'lessons:write',
            'lessons:delete',
            'lessons:publish',
            'lessons:manage_curriculum',
            'lessons:track_progress',
            'lessons:certificates',
            'lessons:assessments',
            'analytics:read_all',
            'analytics:export',
            'analytics:real_time',
            'analytics:custom_reports',
            'analytics:system_metrics',
            'analytics:user_behavior',
            'analytics:financial',
            'system:read_settings',
            'system:write_settings',
            'system:manage_integrations',
            'system:manage_sso',
            'system:manage_ldap',
            'system:manage_oauth',
            'system:manage_backups',
            'system:monitor_logs',
            'system:security_audit',
            'system:performance_monitor',
            'collaboration:read',
            'collaboration:write',
            'collaboration:manage_teams',
            'collaboration:invite_users',
            'collaboration:remove_users',
            'collaboration:real_time_edit',
            'collaboration:voice_call',
            'collaboration:video_call',
            'collaboration:screen_share',
            'collaboration:file_share',
            'enterprise:billing',
            'enterprise:subscriptions',
            'enterprise:usage_limits',
            'enterprise:compliance',
            'enterprise:audit_logs',
            'enterprise:data_retention',
            'enterprise:export_data',
            'enterprise:api_keys',
            'enterprise:webhooks',
            'enterprise:custom_domains',
            'mobile:access',
            'mobile:offline_mode',
            'mobile:push_notifications',
            'mobile:biometric_auth',
            'mobile:device_management',
            'mobile:remote_wipe',
            'api:read',
            'api:write',
            'api:delete',
            'api:admin',
            'api:keys_manage',
            'api:rate_limits',
            'api:webhooks',
            'api:integrations'
        ]);

        // Super Admin role - full system access
        this.assignRolePermissions('super_admin', Array.from(this.permissions.keys()));
    }

    formatPermissionName(permission) {
        return permission.split(':').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    generatePermissionDescription(permission) {
        const [resource, action] = permission.split(':');
        const descriptions = {
            users: {
                read: 'View user information',
                write: 'Modify user information',
                delete: 'Delete user accounts',
                manage_roles: 'Assign and manage user roles',
                impersonate: 'Impersonate other users'
            },
            projects: {
                read: 'View project information',
                write: 'Modify project content',
                delete: 'Delete projects',
                share: 'Share projects with others',
                export: 'Export project data',
                import: 'Import project data'
            },
            analysis: {
                read: 'View analysis results',
                write: 'Create and modify analyses',
                delete: 'Delete analysis results',
                run: 'Run code analysis',
                run_advanced: 'Run advanced analysis features',
                configure: 'Configure analysis settings'
            },
            ai: {
                generate_code: 'Generate code using AI',
                security_scan: 'Perform security analysis',
                performance_optimize: 'Optimize code performance',
                documentation_generate: 'Generate documentation',
                code_review: 'AI-powered code review',
                refactor: 'AI-assisted refactoring',
                debug_assist: 'AI debugging assistance',
                chat_assistant: 'AI chat assistant',
                custom_prompts: 'Create custom AI prompts',
                advanced_models: 'Access advanced AI models'
            },
            lessons: {
                read: 'View lesson content',
                write: 'Create and modify lessons',
                delete: 'Delete lessons',
                publish: 'Publish lessons',
                manage_curriculum: 'Manage curriculum structure',
                track_progress: 'Track learning progress',
                certificates: 'Issue certificates',
                assessments: 'Create assessments'
            },
            analytics: {
                read: 'View analytics data',
                export: 'Export analytics reports',
                real_time: 'Access real-time analytics',
                custom_reports: 'Create custom reports',
                system_metrics: 'View system metrics',
                user_behavior: 'Analyze user behavior',
                financial: 'View financial analytics'
            },
            system: {
                read_settings: 'View system settings',
                write_settings: 'Modify system settings',
                manage_integrations: 'Manage system integrations',
                manage_sso: 'Configure SSO settings',
                manage_ldap: 'Configure LDAP settings',
                manage_oauth: 'Configure OAuth settings',
                manage_backups: 'Manage system backups',
                monitor_logs: 'Access system logs',
                security_audit: 'Perform security audits',
                performance_monitor: 'Monitor system performance',
                database_admin: 'Database administration',
                api_management: 'API management'
            },
            collaboration: {
                read: 'View collaboration content',
                write: 'Participate in collaboration',
                manage_teams: 'Manage collaboration teams',
                invite_users: 'Invite users to collaborate',
                remove_users: 'Remove users from collaboration',
                real_time_edit: 'Real-time collaborative editing',
                voice_call: 'Voice calling',
                video_call: 'Video calling',
                screen_share: 'Screen sharing',
                file_share: 'File sharing'
            },
            enterprise: {
                billing: 'Manage billing information',
                subscriptions: 'Manage subscriptions',
                usage_limits: 'Manage usage limits',
                compliance: 'Compliance management',
                audit_logs: 'Access audit logs',
                data_retention: 'Manage data retention policies',
                export_data: 'Export enterprise data',
                api_keys: 'Manage API keys',
                webhooks: 'Configure webhooks',
                custom_domains: 'Manage custom domains'
            },
            mobile: {
                access: 'Mobile app access',
                offline_mode: 'Offline mode access',
                push_notifications: 'Push notifications',
                biometric_auth: 'Biometric authentication',
                device_management: 'Device management',
                remote_wipe: 'Remote device wipe'
            },
            api: {
                read: 'API read access',
                write: 'API write access',
                delete: 'API delete access',
                admin: 'API administration',
                keys_manage: 'Manage API keys',
                rate_limits: 'Manage rate limits',
                webhooks: 'API webhook management',
                integrations: 'API integrations'
            }
        };

        return descriptions[resource]?.[action] || `${action} ${resource}`;
    }

    getPermissionCategory(permission) {
        const resource = permission.split(':')[0];
        const categories = {
            users: 'User Management',
            projects: 'Project Management',
            analysis: 'Code Analysis',
            ai: 'AI Tools',
            lessons: 'Learning System',
            analytics: 'Analytics & Reporting',
            system: 'System Administration',
            collaboration: 'Collaboration',
            enterprise: 'Enterprise Features',
            mobile: 'Mobile Access',
            api: 'API Access'
        };

        return categories[resource] || 'Other';
    }

    // Role Management
    createRole(roleData) {
        const role = {
            id: roleData.id,
            name: roleData.name,
            description: roleData.description,
            level: roleData.level || 50,
            isSystem: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.roles.set(role.id, role);
        return role;
    }

    updateRole(roleId, updates) {
        const role = this.roles.get(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        if (role.isSystem) {
            throw new Error('Cannot modify system roles');
        }

        Object.assign(role, updates, { updatedAt: new Date() });
        this.roles.set(roleId, role);
        return role;
    }

    deleteRole(roleId) {
        const role = this.roles.get(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        if (role.isSystem) {
            throw new Error('Cannot delete system roles');
        }

        this.roles.delete(roleId);
        this.rolePermissions.delete(roleId);
        
        // Remove role from all users
        for (const [userId, userRoles] of this.userRoles.entries()) {
            const index = userRoles.indexOf(roleId);
            if (index > -1) {
                userRoles.splice(index, 1);
            }
        }
    }

    // Permission Assignment
    assignRolePermissions(roleId, permissions) {
        if (!this.roles.has(roleId)) {
            throw new Error('Role not found');
        }

        // Validate permissions
        for (const permission of permissions) {
            if (!this.permissions.has(permission)) {
                throw new Error(`Invalid permission: ${permission}`);
            }
        }

        this.rolePermissions.set(roleId, new Set(permissions));
    }

    // User Role Management
    assignUserRole(userId, roleId) {
        if (!this.roles.has(roleId)) {
            throw new Error('Role not found');
        }

        if (!this.userRoles.has(userId)) {
            this.userRoles.set(userId, []);
        }

        const userRoles = this.userRoles.get(userId);
        if (!userRoles.includes(roleId)) {
            userRoles.push(roleId);
        }
    }

    removeUserRole(userId, roleId) {
        if (this.userRoles.has(userId)) {
            const userRoles = this.userRoles.get(userId);
            const index = userRoles.indexOf(roleId);
            if (index > -1) {
                userRoles.splice(index, 1);
            }
        }
    }

    // Permission Checking
    hasPermission(userId, permission) {
        const userRoles = this.userRoles.get(userId) || [];
        const userPermissions = this.getUserPermissions(userId);
        return userPermissions.includes(permission);
    }

    hasAnyPermission(userId, permissions) {
        const userPermissions = this.getUserPermissions(userId);
        return permissions.some(permission => userPermissions.includes(permission));
    }

    hasAllPermissions(userId, permissions) {
        const userPermissions = this.getUserPermissions(userId);
        return permissions.every(permission => userPermissions.includes(permission));
    }

    hasRole(userId, roleId) {
        const userRoles = this.userRoles.get(userId) || [];
        return userRoles.includes(roleId);
    }

    hasAnyRole(userId, roles) {
        const userRoles = this.userRoles.get(userId) || [];
        return roles.some(role => userRoles.includes(role));
    }

    getUserPermissions(userId) {
        const userRoles = this.userRoles.get(userId) || [];
        const permissions = new Set();

        for (const roleId of userRoles) {
            const rolePerms = this.rolePermissions.get(roleId);
            if (rolePerms) {
                for (const permission of rolePerms) {
                    permissions.add(permission);
                }
            }
        }

        return Array.from(permissions);
    }

    getUserRoles(userId) {
        return this.userRoles.get(userId) || [];
    }

    // Resource-specific permissions
    checkResourcePermission(userId, resource, action, resourceId = null) {
        const permission = `${resource}:${action}`;
        
        // Check direct permission
        if (this.hasPermission(userId, permission)) {
            return true;
        }

        // Check ownership permissions
        if (resourceId && this.hasPermission(userId, `${resource}:${action}_own`)) {
            return this.isResourceOwner(userId, resource, resourceId);
        }

        // Check team permissions
        if (resourceId && this.hasPermission(userId, `${resource}:${action}_team`)) {
            return this.isResourceInUserTeam(userId, resource, resourceId);
        }

        return false;
    }

    isResourceOwner(userId, resource, resourceId) {
        // This would typically check against a database
        // For now, return a mock implementation
        return true;
    }

    isResourceInUserTeam(userId, resource, resourceId) {
        // This would typically check against a database
        // For now, return a mock implementation
        return true;
    }

    // Query Methods
    getAllRoles() {
        return Array.from(this.roles.values());
    }

    getAllPermissions() {
        return Array.from(this.permissions.values());
    }

    getRolePermissions(roleId) {
        const permissions = this.rolePermissions.get(roleId);
        return permissions ? Array.from(permissions) : [];
    }

    getUsersWithRole(roleId) {
        const users = [];
        for (const [userId, userRoles] of this.userRoles.entries()) {
            if (userRoles.includes(roleId)) {
                users.push(userId);
            }
        }
        return users;
    }

    // Middleware for Express.js
    requirePermission(permission) {
        return (req, res, next) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!this.hasPermission(userId, permission)) {
                return res.status(403).json({ 
                    error: 'Insufficient permissions',
                    required: permission,
                    userPermissions: this.getUserPermissions(userId)
                });
            }

            next();
        };
    }

    requireRole(role) {
        return (req, res, next) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            if (!this.hasRole(userId, role)) {
                return res.status(403).json({ 
                    error: 'Insufficient role',
                    required: role,
                    userRoles: this.getUserRoles(userId)
                });
            }

            next();
        };
    }

    requireResourcePermission(resource, action) {
        return (req, res, next) => {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Authentication required' });
            }

            const resourceId = req.params.id || req.body.id;
            
            if (!this.checkResourcePermission(userId, resource, action, resourceId)) {
                return res.status(403).json({ 
                    error: 'Insufficient resource permissions',
                    resource,
                    action,
                    resourceId
                });
            }

            next();
        };
    }

    // Export/Import
    exportConfiguration() {
        return {
            roles: this.getAllRoles(),
            permissions: this.getAllPermissions(),
            rolePermissions: Object.fromEntries(
                Array.from(this.rolePermissions.entries()).map(([roleId, perms]) => [
                    roleId, Array.from(perms)
                ])
            )
        };
    }

    importConfiguration(config) {
        // Import roles
        config.roles?.forEach(role => {
            this.roles.set(role.id, role);
        });

        // Import permissions
        config.permissions?.forEach(permission => {
            this.permissions.set(permission.id, permission);
        });

        // Import role permissions
        config.rolePermissions?.forEach(([roleId, permissions]) => {
            this.rolePermissions.set(roleId, new Set(permissions));
        });
    }
}

module.exports = RBAC;
