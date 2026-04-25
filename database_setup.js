const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

// Database setup for Zenvora AI Platform
class DatabaseManager {
    constructor(dbPath = './zenvora_platform.db') {
        this.dbPath = dbPath;
        this.db = null;
        this.init();
    }

    init() {
        console.log('🗄️ Initializing SQLite database...');
        
        // Create database directory if it doesn't exist
        const dbDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.ensureDirSync(dbDir);
        }
        
        // Connect to database
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                throw err;
            }
            console.log('✅ Database connected successfully');
            this.createTables();
        });
    }

    createTables() {
        console.log('📋 Creating database tables...');
        
        // Users table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                avatar TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                settings TEXT
            )
        `);

        // Projects table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                language TEXT,
                code TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                collaborators TEXT,
                tags TEXT,
                visibility TEXT DEFAULT 'private',
                status TEXT DEFAULT 'active'
            )
        `);

        // Analyses table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS analyses (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                code TEXT NOT NULL,
                language TEXT NOT NULL,
                metrics TEXT,
                suggestions TEXT,
                issues TEXT,
                insights TEXT,
                recommendations TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Sessions table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                expires_at DATETIME NOT NULL,
                last_activity DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // AI Tools usage table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS ai_tool_usage (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                tool_name TEXT NOT NULL,
                input_data TEXT,
                output_data TEXT,
                processing_time INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database tables created successfully');
    }

    // User management methods
    async createUser(userData) {
        return new Promise((resolve, reject) => {
            const { username, email, password, name } = userData;
            
            // Hash password (in production, use bcrypt)
            const passwordHash = this.hashPassword(password);
            
            const user = {
                id: this.generateId(),
                username,
                email,
                passwordHash,
                name: name || username,
                avatar: name ? name[0].toUpperCase() : '👤',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                settings: JSON.stringify({
                    theme: 'dark',
                    aiModel: 'advanced',
                    notifications: true,
                    autoSave: true
                })
            };

            this.db.run(`
                INSERT INTO users (id, username, email, password_hash, name, avatar, created_at, updated_at, settings)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                user.id, user.username, user.email, user.passwordHash, 
                user.name, user.avatar, user.createdAt, user.updatedAt, user.settings
            ], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });
    }

    async authenticateUser(username, password) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT id, username, email, password_hash, name, avatar, settings
                FROM users 
                WHERE username = ? OR email = ?
            `, [username, username], (err, user) => {
                if (err) {
                    reject(err);
                } else if (!user) {
                    reject(new Error('User not found'));
                } else {
                    // Verify password
                    const passwordHash = this.hashPassword(password);
                    if (user.password_hash === passwordHash) {
                        resolve(user);
                    } else {
                        reject(new Error('Invalid password'));
                    }
                }
            });
        });
    }

    async createSession(userId) {
        return new Promise((resolve, reject) => {
            const token = this.generateId();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            
            this.db.run(`
                INSERT INTO sessions (token, user_id, created_at, expires_at)
                VALUES (?, ?, ?, ?)
            `, [token, userId, new Date().toISOString(), expiresAt.toISOString()], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        });
    }

    async validateSession(token) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT s.user_id, u.username, u.email, u.name, u.avatar, u.settings, s.expires_at
                FROM sessions s
                JOIN users u ON s.user_id = u.id
                WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP
            `, [token], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    reject(new Error('Invalid or expired session'));
                } else {
                    resolve({
                        userId: row.user_id,
                        username: row.username,
                        email: row.email,
                        name: row.name,
                        avatar: row.avatar,
                        settings: JSON.parse(row.settings || '{}'),
                        expiresAt: row.expires_at
                    });
                }
            });
        });
    }

    // Project management methods
    async createProject(projectData) {
        return new Promise((resolve, reject) => {
            const project = {
                id: this.generateId(),
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                collaborators: JSON.stringify([]),
                tags: JSON.stringify([])
            };

            this.db.run(`
                INSERT INTO projects (id, user_id, name, description, language, code, created_at, updated_at, collaborators, tags, visibility, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                project.id, project.userId, project.name, project.description || '',
                project.language || 'javascript', project.code || '',
                project.createdAt, project.updatedAt, project.collaborators,
                project.tags, project.visibility || 'private', project.status || 'active'
            ], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(project);
                }
            });
        });
    }

    async getProjects(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT id, name, description, language, created_at, updated_at, collaborators, tags, visibility, status
                FROM projects 
                WHERE user_id = ? AND status = 'active'
                ORDER BY updated_at DESC
            `, [userId], (err, projects) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(projects);
                }
            });
        });
    }

    async updateProject(projectId, updates) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE projects 
                SET name = ?, description = ?, language = ?, code = ?, updated_at = ?, collaborators = ?, tags = ?
                WHERE id = ?
            `, [
                updates.name, updates.description, updates.language, updates.code,
                new Date().toISOString(), JSON.stringify(updates.collaborators || []),
                JSON.stringify(updates.tags || []), projectId
            ], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    async deleteProject(projectId) {
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE projects 
                SET status = 'deleted', updated_at = ?
                WHERE id = ?
            `, [new Date().toISOString(), projectId], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    // Analysis storage methods
    async saveAnalysis(analysis) {
        return new Promise((resolve, reject) => {
            const analysisData = {
                id: this.generateId(),
                ...analysis,
                createdAt: new Date().toISOString()
            };

            this.db.run(`
                INSERT INTO analyses (id, project_id, code, language, metrics, suggestions, issues, insights, recommendations, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                analysisData.id, analysis.projectId, analysis.code, analysis.language,
                JSON.stringify(analysis.metrics), JSON.stringify(analysis.suggestions),
                JSON.stringify(analysis.issues), JSON.stringify(analysis.insights),
                JSON.stringify(analysis.recommendations), analysisData.createdAt
            ], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(analysisData);
                }
            });
        });
    }

    async getAnalyses(projectId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT id, project_id, code, language, metrics, suggestions, issues, insights, recommendations, created_at
                FROM analyses 
                WHERE project_id = ?
                ORDER BY created_at DESC
            `, [projectId], (err, analyses) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(analyses);
                }
            });
        });
    }

    // AI tool usage tracking
    async logToolUsage(userId, toolName, inputData, outputData, processingTime) {
        return new Promise((resolve, reject) => {
            const usage = {
                id: this.generateId(),
                userId,
                toolName,
                inputData: JSON.stringify(inputData),
                outputData: JSON.stringify(outputData),
                processingTime,
                createdAt: new Date().toISOString()
            };

            this.db.run(`
                INSERT INTO ai_tool_usage (id, user_id, tool_name, input_data, output_data, processing_time, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [usage.id, usage.userId, usage.toolName, usage.inputData, 
                usage.outputData, usage.processingTime, usage.createdAt], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(usage);
                }
            });
        });
    }

    // Utility methods
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    hashPassword(password) {
        // Simple hash for demo (in production, use bcrypt)
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(password).digest('hex');
    }

    // Cleanup expired sessions
    async cleanupExpiredSessions() {
        return new Promise((resolve, reject) => {
            this.db.run(`
                DELETE FROM sessions 
                WHERE expires_at < CURRENT_TIMESTAMP
            `, [], (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                } else {
                    console.log('✅ Database connection closed');
                }
            });
        }
    }
}

module.exports = DatabaseManager;
