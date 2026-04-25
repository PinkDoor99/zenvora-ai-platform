const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Server } = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3002; // Different port for collaboration server

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'file://'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage for collaboration
const activeProjects = new Map();
const activeUsers = new Map();
const collaborationSessions = new Map();
const codeChanges = new Map();

// WebSocket server for real-time collaboration
const wss = new Server({ port: 3003 });

// Collaboration event handlers
wss.on('connection', (ws) => {
    const sessionId = generateSessionId();
    const collaboration = {
        id: sessionId,
        users: [],
        project: null,
        code: '',
        changes: [],
        createdAt: new Date().toISOString()
    };
    
    collaborationSessions.set(sessionId, collaboration);
    
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleCollaborationMessage(ws, data, sessionId);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });
    
    ws.on('close', () => {
        collaborationSessions.delete(sessionId);
        console.log(`Collaboration session ${sessionId} closed`);
    });
    
    ws.send(JSON.stringify({
        type: 'connection',
        sessionId: sessionId,
        status: 'connected',
        timestamp: new Date().toISOString()
    }));
});

function handleCollaborationMessage(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    if (!session) return;
    
    switch (data.type) {
        case 'join_project':
            handleJoinProject(ws, data, sessionId);
            break;
        case 'code_change':
            handleCodeChange(ws, data, sessionId);
            break;
        case 'cursor_move':
            handleCursorMove(ws, data, sessionId);
            break;
        case 'user_typing':
            handleUserTyping(ws, data, sessionId);
            break;
        case 'chat_message':
            handleChatMessage(ws, data, sessionId);
            break;
        case 'voice_call':
            handleVoiceCall(ws, data, sessionId);
            break;
    }
}

function handleJoinProject(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    const project = activeProjects.get(data.projectId);
    
    if (project) {
        session.project = project;
        session.users.push({
            id: data.userId,
            name: data.userName,
            avatar: data.avatar || '👤',
            joinedAt: new Date().toISOString()
        });
        
        // Add user to project
        if (!project.collaborators) {
            project.collaborators = [];
        }
        
        const existingUser = project.collaborators.find(u => u.id === data.userId);
        if (!existingUser) {
            project.collaborators.push({
                id: data.userId,
                name: data.userName,
                avatar: data.avatar || '👤',
                role: data.role || 'editor',
                joinedAt: new Date().toISOString()
            });
        }
        
        // Notify other users in the project
        broadcastToProject(data.projectId, {
            type: 'user_joined',
            user: { id: data.userId, name: data.userName, avatar: data.avatar },
            timestamp: new Date().toISOString()
        }, sessionId);
        
        console.log(`User ${data.userName} joined project ${data.projectId}`);
    }
}

function handleCodeChange(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    if (!session || !session.project) return;
    
    const change = {
        id: generateId(),
        userId: data.userId,
        userName: data.userName,
        change: data.change,
        timestamp: new Date().toISOString(),
        line: data.line || null,
        position: data.position || null
    };
    
    // Store change
    if (!codeChanges.has(session.project.id)) {
        codeChanges.set(session.project.id, []);
    }
    codeChanges.get(session.project.id).push(change);
    
    // Broadcast to all users in project
    broadcastToProject(session.project.id, {
        type: 'code_change',
        change: change,
        timestamp: new Date().toISOString()
    }, sessionId);
    
    // Update project code
    session.project.code = data.newCode;
    session.project.updatedAt = new Date().toISOString();
    
    console.log(`Code change in project ${session.project.id} by ${data.userName}`);
}

function handleCursorMove(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    if (!session || !session.project) return;
    
    broadcastToProject(session.project.id, {
        type: 'cursor_move',
        userId: data.userId,
        userName: data.userName,
        position: data.position,
        timestamp: new Date().toISOString()
    }, sessionId);
}

function handleUserTyping(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    if (!session || !session.project) return;
    
    broadcastToProject(session.project.id, {
        type: 'user_typing',
        userId: data.userId,
        userName: data.userName,
        isTyping: data.isTyping,
        timestamp: new Date().toISOString()
    }, sessionId);
}

function handleChatMessage(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    if (!session || !session.project) return;
    
    const message = {
        id: generateId(),
        userId: data.userId,
        userName: data.userName,
        avatar: data.avatar || '👤',
        message: data.message,
        timestamp: new Date().toISOString()
    };
    
    broadcastToProject(session.project.id, {
        type: 'chat_message',
        message: message,
        timestamp: new Date().toISOString()
    }, sessionId);
    
    console.log(`Chat message in project ${session.project.id} from ${data.userName}`);
}

function handleVoiceCall(ws, data, sessionId) {
    const session = collaborationSessions.get(sessionId);
    if (!session || !session.project) return;
    
    broadcastToProject(session.project.id, {
        type: 'voice_call',
        userId: data.userId,
        userName: data.userName,
        action: data.action, // 'start', 'end', 'join'
        timestamp: new Date().toISOString()
    }, sessionId);
    
    console.log(`Voice call ${data.action} in project ${session.project.id} by ${data.userName}`);
}

function broadcastToProject(projectId, message, excludeSessionId = null) {
    const project = activeProjects.get(projectId);
    if (!project) return;
    
    // Get all collaboration sessions for this project
    const projectSessions = Array.from(collaborationSessions.values())
        .filter(session => session.project && session.project.id === projectId);
    
    // Broadcast to all users in the project
    projectSessions.forEach(session => {
        if (session.id !== excludeSessionId) {
            session.users.forEach(ws => {
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify({
                        ...message,
                        projectId: projectId
                    }));
                }
            });
        }
    });
}

// REST API Routes
app.post('/api/collaboration/join', (req, res) => {
    const { projectId, userId, userName, role } = req.body;
    
    if (!projectId || !userId || !userName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create or get project
    let project = activeProjects.get(projectId);
    if (!project) {
        project = {
            id: projectId,
            name: `Project ${projectId}`,
            description: 'Collaborative project',
            code: '// Start coding together\nconsole.log("Hello World!");',
            collaborators: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        activeProjects.set(projectId, project);
    }
    
    res.json({
        success: true,
        project,
        message: 'Joined project successfully'
    });
});

app.post('/api/collaboration/leave', (req, res) => {
    const { projectId, userId } = req.body;
    
    if (!projectId || !userId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const project = activeProjects.get(projectId);
    if (project) {
        project.collaborators = project.collaborators.filter(u => u.id !== userId);
    }
    
    res.json({
        success: true,
        message: 'Left project successfully'
    });
});

app.get('/api/collaboration/projects/:userId', (req, res) => {
    const { userId } = req.params;
    const projects = Array.from(activeProjects.values())
        .filter(project => project.collaborators && project.collaborators.some(u => u.id === userId));
    
    res.json(projects);
});

app.get('/api/collaboration/history/:projectId', (req, res) => {
    const { projectId } = req.params;
    const changes = codeChanges.get(projectId) || [];
    
    res.json({
        success: true,
        changes: changes.slice(-50), // Last 50 changes
        totalChanges: changes.length
    });
});

app.post('/api/collaboration/chat/:projectId', (req, res) => {
    const { projectId, userId, message, userName } = req.body;
    
    if (!projectId || !userId || !message) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const project = activeProjects.get(projectId);
    if (!project) {
        return res.status(404).json({ error: 'Project not found' });
    }
    
    // Store chat message (in production, use database)
    const chatMessage = {
        id: generateId(),
        projectId,
        userId,
        userName,
        message,
        timestamp: new Date().toISOString()
    };
    
    // Broadcast to all users in project
    broadcastToProject(projectId, {
        type: 'chat_message',
        message: chatMessage,
        timestamp: new Date().toISOString()
    });
    
    res.json({
        success: true,
        message: 'Chat message sent'
    });
});

// Voice call endpoints
app.post('/api/collaboration/voice/start', (req, res) => {
    const { projectId, userId, roomId } = req.body;
    
    if (!projectId || !userId || !roomId) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create voice room (simplified - in production use WebRTC)
    const voiceRoom = {
        id: roomId,
        projectId,
        participants: [userId],
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    res.json({
        success: true,
        roomId,
        message: 'Voice call started'
    });
});

app.post('/api/collaboration/voice/end', (req, res) => {
    const { roomId } = req.body;
    
    res.json({
        success: true,
        message: 'Voice call ended'
    });
});

// Utility functions
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Collaboration server error', 
        details: err.message 
    });
});

// Start servers
const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`🚀 Collaboration Server Started!`);
    console.log(`📡 REST API: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:3003`);
    console.log('');
    console.log('🤝 Real-time Features:');
    console.log('   • Multi-user code editing');
    console.log('   • Live cursor tracking');
    console.log('   • Real-time chat');
    console.log('   • Voice call support');
    console.log('   • Change history tracking');
    console.log('   • Project collaboration');
    console.log('');
});

wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

module.exports = { app, server, wss };
