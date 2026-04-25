// Enhanced Frontend with Real-Time Collaboration
// Integrates with collaboration server for live features

class EnhancedFrontend {
    constructor() {
        this.collaborationServer = null;
        this.currentUser = null;
        this.activeProject = null;
        this.wsConnection = null;
        this.isCollaborating = false;
        this.activeUsers = new Map(); // userId -> { name, avatar, cursor, color }
        this.codeChanges = [];
        this.chatMessages = [];
        this.voiceCallActive = false;
        this.currentVoiceRoom = null;
    }

    async initialize() {
        try {
            // Connect to collaboration server
            this.wsConnection = new WebSocket('ws://localhost:3003');
            
            this.wsConnection.onopen = () => {
                console.log('🔗 Connected to collaboration server');
                this.sendAuthentication();
            };
            
            this.wsConnection.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleServerMessage(data);
            };
            
            this.wsConnection.onclose = () => {
                console.log('🔌 Disconnected from collaboration server');
                this.isCollaborating = false;
                this.updateUI();
            };
            
            // Load saved user data
            this.loadUserProfile();
            
        } catch (error) {
            console.error('Failed to connect to collaboration server:', error);
            this.showNotification('Failed to connect to collaboration server', 'error');
        }
    }

    sendAuthentication() {
        const savedUser = localStorage.getItem('zenvora_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.wsConnection.send(JSON.stringify({
                type: 'authenticate',
                token: localStorage.getItem('zenvora_session'),
                user: this.currentUser
            }));
        }
    }

    handleServerMessage(data) {
        switch (data.type) {
            case 'authenticated':
                this.handleAuthentication(data);
                break;
            case 'project_joined':
                this.handleProjectJoined(data);
                break;
            case 'user_joined':
                this.handleUserJoined(data);
                break;
            case 'user_left':
                this.handleUserLeft(data);
                break;
            case 'code_change':
                this.handleCodeChange(data);
                break;
            case 'cursor_move':
                this.handleCursorMove(data);
                break;
            case 'user_typing':
                this.handleUserTyping(data);
                break;
            case 'chat_message':
                this.handleChatMessage(data);
                break;
            case 'voice_call':
                this.handleVoiceCall(data);
                break;
        }
    }

    handleAuthentication(data) {
        if (data.success) {
            this.isCollaborating = true;
            this.showNotification('Connected to collaboration server', 'success');
            this.updateUI();
        } else {
            this.showNotification('Authentication failed', 'error');
        }
    }

    handleProjectJoined(data) {
        this.activeProject = data.project;
        this.isCollaborating = true;
        this.showNotification(`Joined project: ${data.project.name}`, 'success');
        this.updateUI();
    }

    handleUserJoined(data) {
        this.activeUsers.set(data.user.id, {
            id: data.user.id,
            name: data.user.name,
            avatar: data.user.avatar,
            cursor: { line: 1, column: 1 },
            color: this.generateUserColor(data.user.id),
            isTyping: false
        });
        
        this.showNotification(`${data.user.name} joined the project`, 'info');
        this.updateActiveUsers();
    }

    handleUserLeft(data) {
        this.activeUsers.delete(data.user.id);
        this.showNotification(`${data.user.name} left the project`, 'info');
        this.updateActiveUsers();
    }

    handleCodeChange(data) {
        this.codeChanges.push(data);
        this.showNotification(`${data.userName} made changes`, 'info');
        this.updateCodeEditor();
    }

    handleCursorMove(data) {
        const user = this.activeUsers.get(data.userId);
        if (user) {
            user.cursor = data.position;
            this.updateCursors();
        }
    }

    handleUserTyping(data) {
        const user = this.activeUsers.get(data.userId);
        if (user) {
            user.isTyping = data.isTyping;
            this.updateTypingIndicators();
        }
    }

    handleChatMessage(data) {
        this.chatMessages.push(data);
        this.showNotification(`${data.userName}: ${data.message}`, 'info');
        this.updateChat();
    }

    handleVoiceCall(data) {
        if (data.action === 'start') {
            this.voiceCallActive = true;
            this.currentVoiceRoom = data.roomId;
            this.showNotification('Voice call started', 'info');
        } else if (data.action === 'end') {
            this.voiceCallActive = false;
            this.currentVoiceRoom = null;
            this.showNotification('Voice call ended', 'info');
        }
        this.updateVoiceUI();
    }

    generateUserColor(userId) {
        const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];
        const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }

    updateUI() {
        // Update collaboration status indicator
        const statusIndicator = document.getElementById('collaboration-status');
        if (statusIndicator) {
            statusIndicator.textContent = this.isCollaborating ? '🟢 Collaborating' : '🔴 Disconnected';
            statusIndicator.style.color = this.isCollaborating ? '#10b981' : '#ef4444';
        }
        
        // Update active users list
        this.updateActiveUsers();
        
        // Update project info
        this.updateProjectInfo();
    }

    updateActiveUsers() {
        const activeUsersList = document.getElementById('active-users');
        if (activeUsersList) {
            activeUsersList.innerHTML = '';
            
            this.activeUsers.forEach((user, userId) => {
                const userElement = document.createElement('div');
                userElement.className = 'active-user';
                userElement.style.cssText = `
                    background: ${user.color}20;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    margin: 4px;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    position: relative;
                `;
                
                userElement.innerHTML = `
                    <span style="font-weight: bold;">${user.avatar}</span>
                    <span>${user.name}</span>
                    ${user.isTyping ? '<span style="color: #ffd700;">⌨️ typing...</span>' : ''}
                    ${user.id === this.currentUser?.id ? '<span style="background: #10b981; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">YOU</span>' : ''}
                `;
                
                // Add cursor
                if (user.cursor) {
                    const cursorElement = document.createElement('div');
                    cursorElement.className = 'user-cursor';
                    cursorElement.style.cssText = `
                        position: absolute;
                        left: ${user.cursor.column * 20}px;
                        top: ${user.cursor.line * 20}px;
                        width: 2px;
                        height: 20px;
                        background: ${user.color};
                        border-radius: 2px;
                        pointer-events: none;
                    `;
                    userElement.appendChild(cursorElement);
                }
                
                activeUsersList.appendChild(userElement);
            });
        }
    }

    updateCursors() {
        // Update all user cursors in the code editor
        const codeEditor = document.getElementById('code-editor');
        if (!codeEditor) return;
        
        // Remove existing cursors
        codeEditor.querySelectorAll('.user-cursor').forEach(el => el.remove());
        
        // Add current cursors
        this.activeUsers.forEach((user, userId) => {
            if (user.cursor && user.id !== this.currentUser?.id) {
                const cursorElement = document.createElement('div');
                cursorElement.className = 'user-cursor';
                cursorElement.style.cssText = `
                    position: absolute;
                    left: ${user.cursor.column * 20}px;
                    top: ${user.cursor.line * 20}px;
                    width: 2px;
                    height: 20px;
                    background: ${user.color};
                    border-radius: 2px;
                    pointer-events: none;
                    z-index: 1000;
                `;
                codeEditor.appendChild(cursorElement);
            }
        });
    }

    updateTypingIndicators() {
        // Update typing indicators for all users
        this.activeUsers.forEach((user, userId) => {
            const userElement = document.querySelector(`[data-user-id="${userId}"]`);
            if (userElement) {
                const typingIndicator = userElement.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.style.display = user.isTyping ? 'inline' : 'none';
                }
            }
        });
    }

    updateProjectInfo() {
        const projectInfo = document.getElementById('project-info');
        if (projectInfo && this.activeProject) {
            projectInfo.innerHTML = `
                <h3>${this.activeProject.name}</h3>
                <p>${this.activeProject.description}</p>
                <small>Language: ${this.activeProject.language} | Users: ${this.activeProject.collaborators?.length || 0}</small>
            `;
        }
    }

    updateCodeEditor() {
        const codeEditor = document.getElementById('code-editor');
        if (!codeEditor) return;
        
        // Apply remote changes
        this.codeChanges.forEach(change => {
            if (change.userId !== this.currentUser?.id) return;
            
            // Apply change to editor
            if (change.type === 'insert') {
                const lines = codeEditor.value.split('\n');
                lines[change.line - 1] = (lines[change.line - 1] || '') + change.text + lines[change.line - 1].slice(change.position);
                codeEditor.value = lines.join('\n');
            } else if (change.type === 'delete') {
                const lines = codeEditor.value.split('\n');
                const line = lines[change.line - 1] || '';
                lines[change.line - 1] = line.slice(0, change.position - 1) + line.slice(change.position);
                codeEditor.value = lines.join('\n');
            }
        });
        
        // Clear applied changes
        this.codeChanges = [];
    }

    updateChat() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        chatMessages.innerHTML = '';
        this.chatMessages.slice(-50).forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = 'chat-message';
            messageElement.style.cssText = `
                margin: 8px 0;
                padding: 12px;
                border-radius: 8px;
                background: var(--bg-card);
                border-left: 4px solid ${this.generateUserColor(msg.userId)};
            `;
            
            messageElement.innerHTML = `
                <div style="font-weight: bold; color: ${this.generateUserColor(msg.userId)};">
                    ${msg.avatar} ${msg.userName}
                </div>
                <div style="margin-top: 4px; color: var(--text-secondary);">
                    ${msg.message}
                </div>
                <div style="margin-top: 4px; font-size: 12px; color: var(--text-muted);">
                    ${new Date(msg.timestamp).toLocaleTimeString()}
                </div>
            `;
            
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    updateVoiceUI() {
        const voiceStatus = document.getElementById('voice-status');
        if (voiceStatus) {
            voiceStatus.innerHTML = this.voiceCallActive ? 
                '🔊 Voice Call Active<br><small>Room: ${this.currentVoiceRoom}</small>' : 
                '📞 Voice Call Inactive';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'collaboration-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--accent-success)' : type === 'error' ? 'var(--accent-error)' : 'var(--accent-primary)'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    loadUserProfile() {
        const savedUser = localStorage.getItem('zenvora_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }

    // Public methods
    joinProject(projectId) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'join_project',
                projectId: projectId,
                userId: this.currentUser?.id
            }));
        }
    }

    leaveProject() {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'leave_project',
                userId: this.currentUser?.id
            }));
        }
    }

    sendCodeChange(change) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'code_change',
                ...change,
                userId: this.currentUser?.id
            }));
        }
    }

    sendChatMessage(message) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'chat_message',
                message: message,
                userId: this.currentUser?.id
            }));
        }
    }

    startVoiceCall(roomId) {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'voice_call',
                action: 'start',
                roomId: roomId,
                userId: this.currentUser?.id
            }));
        }
    }

    endVoiceCall() {
        if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
            this.wsConnection.send(JSON.stringify({
                type: 'voice_call',
                action: 'end',
                userId: this.currentUser?.id
            }));
        }
    }
}

// Initialize enhanced frontend
const enhancedFrontend = new EnhancedFrontend();

// Auto-start when page loads
document.addEventListener('DOMContentLoaded', () => {
    enhancedFrontend.initialize();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFrontend;
}
