/**
 * Zenvora AI Platform - Subscription UI Components
 * Frontend subscription management and upgrade prompts
 */

class SubscriptionUI {
    constructor() {
        this.currentUser = null;
        this.userSubscription = null;
        this.subscriptionTiers = null;
        this.sessionTimer = null;
        this.usageTracker = new Map();
        
        this.initialize();
    }

    async initialize() {
        await this.loadUserData();
        await this.loadSubscriptionTiers();
        this.setupEventListeners();
        this.startSessionTracking();
        this.updateUI();
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/user/profile');
            this.currentUser = await response.json();
            
            const subResponse = await fetch(`/api/subscription/user/${this.currentUser.id}`);
            this.userSubscription = await subResponse.json();
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    async loadSubscriptionTiers() {
        try {
            const response = await fetch('/api/subscription/tiers');
            this.subscriptionTiers = await response.json();
        } catch (error) {
            console.error('Failed to load subscription tiers:', error);
        }
    }

    setupEventListeners() {
        // Track user interactions for usage limits
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-feature]')) {
                const feature = e.target.closest('[data-feature]').dataset.feature;
                this.trackFeatureUsage(feature);
            }
        });

        // Monitor code editor usage
        const codeEditor = document.getElementById('code-editor');
        if (codeEditor) {
            codeEditor.addEventListener('input', () => {
                this.trackFeatureUsage('codeEditor');
            });
        }

        // Monitor AI tool usage
        document.querySelectorAll('[data-ai-tool]').forEach(button => {
            button.addEventListener('click', (e) => {
                const tool = e.target.closest('[data-ai-tool]').dataset.aiTool;
                this.checkAIAccess(tool);
            });
        });

        // Monitor lesson access
        document.querySelectorAll('[data-lesson-level]').forEach(lesson => {
            lesson.addEventListener('click', (e) => {
                const level = e.target.closest('[data-lesson-level]').dataset.lessonLevel;
                this.checkLessonAccess(level);
            });
        });
    }

    startSessionTracking() {
        if (this.userSubscription?.tier === 'free') {
            this.sessionTimer = setInterval(() => {
                this.trackFeatureUsage('sessionTime', 1);
            }, 1000); // Track every second
        }
    }

    async trackFeatureUsage(feature, amount = 1) {
        try {
            const response = await fetch('/api/subscription/track-usage', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    feature,
                    amount
                })
            });

            const result = await response.json();
            
            if (!result.success) {
                this.handleUsageLimitExceeded(result.limit);
            }
        } catch (error) {
            console.error('Failed to track usage:', error);
        }
    }

    async checkFeatureAccess(feature) {
        try {
            const response = await fetch('/api/subscription/check-access', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    feature
                })
            });

            const result = await response.json();
            
            if (!result.hasAccess) {
                this.showUpgradePrompt(feature);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to check feature access:', error);
            return false;
        }
    }

    async checkAIAccess(tool) {
        const featureMap = {
            'generate-code': 'aiCodeGeneration',
            'security-scan': 'aiSecurityScan',
            'performance-optimize': 'aiPerformanceOptimization',
            'documentation': 'aiDocumentation'
        };

        const feature = featureMap[tool];
        if (!feature) return true;

        return await this.checkFeatureAccess(feature);
    }

    async checkLessonAccess(level) {
        const featureMap = {
            'beginner': 'basicLessons',
            'intermediate': 'advancedLessons',
            'advanced': 'advancedLessons',
            'expert': 'expertLessons'
        };

        const feature = featureMap[level];
        if (!feature) return true;

        return await this.checkFeatureAccess(feature);
    }

    handleUsageLimitExceeded(limit) {
        switch (limit.reason) {
            case 'time_limit_exceeded':
                this.showTimeLimitModal(limit);
                break;
            case 'ai_limit_exceeded':
                this.showAILimitModal(limit);
                break;
            case 'project_limit_exceeded':
                this.showProjectLimitModal(limit);
                break;
            default:
                this.showGenericLimitModal(limit);
        }
    }

    showTimeLimitModal(limit) {
        const modal = this.createModal('⏰ Time Limit Reached', `
            <div class="limit-modal-content">
                <div class="limit-icon">⏰</div>
                <h3>Free Tier Time Limit Reached</h3>
                <p>You've used your ${limit.upgradeTier === 'starter' ? '30 minutes' : '1 hour'} of free usage.</p>
                <p>Upgrade to <strong>${this.subscriptionTiers[limit.upgradeTier].name}</strong> to continue coding!</p>
                
                <div class="upgrade-features">
                    <h4>With ${this.subscriptionTiers[limit.upgradeTier].name} you get:</h4>
                    <ul>
                        <li>✅ Unlimited coding time</li>
                        <li>✅ ${limit.upgradeTier === 'starter' ? '50' : '500'} AI requests per day</li>
                        <li>✅ ${limit.upgradeTier === 'starter' ? '10' : '50'} projects</li>
                        <li>✅ ${limit.upgradeTier === 'starter' ? '1GB' : '5GB'} storage</li>
                    </ul>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="subscriptionUI.upgradeToTier('${limit.upgradeTier}')">
                        Upgrade for $${this.subscriptionTiers[limit.upgradeTier].price}/month
                    </button>
                    <button class="btn btn-secondary" onclick="subscriptionUI.closeModal()">Maybe Later</button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showAILimitModal(limit) {
        const modal = this.createModal('🤖 AI Limit Reached', `
            <div class="limit-modal-content">
                <div class="limit-icon">🤖</div>
                <h3>Daily AI Limit Reached</h3>
                <p>You've used all your AI requests for today.</p>
                <p>Upgrade to <strong>${this.subscriptionTiers[limit.upgradeTier].name}</strong> for more AI power!</p>
                
                <div class="upgrade-features">
                    <h4>${this.subscriptionTiers[limit.upgradeTier].name} includes:</h4>
                    <ul>
                        <li>✅ ${limit.upgradeTier === 'starter' ? '50' : '500'} AI requests per day</li>
                        <li>✅ Advanced AI models</li>
                        <li>✅ Code generation</li>
                        <li>✅ Security scanning</li>
                        <li>✅ Performance optimization</li>
                    </ul>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="subscriptionUI.upgradeToTier('${limit.upgradeTier}')">
                        Upgrade for $${this.subscriptionTiers[limit.upgradeTier].price}/month
                    </button>
                    <button class="btn btn-secondary" onclick="subscriptionUI.closeModal()">Maybe Later</button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showProjectLimitModal(limit) {
        const modal = this.createModal('📁 Project Limit Reached', `
            <div class="limit-modal-content">
                <div class="limit-icon">📁</div>
                <h3>Project Limit Reached</h3>
                <p>You've created the maximum number of projects for your plan.</p>
                <p>Upgrade to <strong>${this.subscriptionTiers[limit.upgradeTier].name}</strong> to create more projects!</p>
                
                <div class="upgrade-features">
                    <h4>${this.subscriptionTiers[limit.upgradeTier].name} includes:</h4>
                    <ul>
                        <li>✅ ${limit.upgradeTier === 'starter' ? '10' : '50'} projects</li>
                        <li>✅ ${limit.upgradeTier === 'starter' ? '1GB' : '5GB'} storage</li>
                        <li>✅ Advanced collaboration features</li>
                        <li>✅ Priority support</li>
                    </ul>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="subscriptionUI.upgradeToTier('${limit.upgradeTier}')">
                        Upgrade for $${this.subscriptionTiers[limit.upgradeTier].price}/month
                    </button>
                    <button class="btn btn-secondary" onclick="subscriptionUI.closeModal()">Maybe Later</button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showUpgradePrompt(feature) {
        const currentTier = this.userSubscription?.tier || 'free';
        const upgradeTier = this.getUpgradeTierForFeature(feature);
        
        if (!upgradeTier) return;

        const modal = this.createModal('🔒 Upgrade Required', `
            <div class="upgrade-modal-content">
                <div class="upgrade-icon">🔒</div>
                <h3>Upgrade to Access This Feature</h3>
                <p>This feature requires a <strong>${this.subscriptionTiers[upgradeTier].name}</strong> subscription.</p>
                
                <div class="current-plan-info">
                    <p>Current plan: <strong>${this.subscriptionTiers[currentTier].name}</strong></p>
                    <p>Upgrade to: <strong>${this.subscriptionTiers[upgradeTier].name}</strong></p>
                </div>
                
                <div class="upgrade-features">
                    <h4>What you'll get:</h4>
                    <ul>
                        ${this.getUpgradeFeatures(currentTier, upgradeTier)}
                    </ul>
                </div>
                
                <div class="pricing-info">
                    <div class="price">$${this.subscriptionTiers[upgradeTier].price}<span>/month</span></div>
                    <div class="savings">Save ${this.calculateSavings(upgradeTier)}% vs monthly</div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="subscriptionUI.upgradeToTier('${upgradeTier}')">
                        Upgrade Now
                    </button>
                    <button class="btn btn-secondary" onclick="subscriptionUI.closeModal()">Maybe Later</button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    getUpgradeTierForFeature(feature) {
        // Find the minimum tier that includes this feature
        for (const [tierId, tier] of Object.entries(this.subscriptionTiers)) {
            if (tier.features[feature]) {
                return tierId;
            }
        }
        return null;
    }

    getUpgradeFeatures(currentTier, upgradeTier) {
        const current = this.subscriptionTiers[currentTier].features;
        const upgrade = this.subscriptionTiers[upgradeTier].features;
        const features = [];

        for (const [feature, enabled] of Object.entries(upgrade)) {
            if (enabled && !current[feature]) {
                features.push(this.getFeatureDisplayName(feature));
            }
        }

        return features.map(f => `<li>✅ ${f}</li>`).join('');
    }

    getFeatureDisplayName(feature) {
        const names = {
            aiCodeGeneration: 'AI Code Generation',
            aiSecurityScan: 'Security Scanning',
            aiPerformanceOptimization: 'Performance Optimization',
            aiDocumentation: 'Documentation Generation',
            advancedLessons: 'Advanced Lessons',
            expertLessons: 'Expert Lessons',
            certificates: 'Certificates',
            voiceCalls: 'Voice Calls',
            videoCalls: 'Video Calls',
            apiAccess: 'API Access',
            ssoIntegration: 'SSO Integration'
        };
        return names[feature] || feature;
    }

    calculateSavings(tierId) {
        // Mock calculation - in real app, calculate based on annual pricing
        return 20;
    }

    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="subscriptionUI.closeModal()"></div>
            <div class="modal-container">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" onclick="subscriptionUI.closeModal()">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }

    closeModal() {
        const modal = document.querySelector('.subscription-modal');
        if (modal) {
            modal.remove();
        }
    }

    async upgradeToTier(tierId) {
        try {
            const response = await fetch('/api/subscription/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: this.currentUser.id,
                    tierId,
                    successUrl: `${window.location.origin}/subscription/success`,
                    cancelUrl: `${window.location.origin}/subscription/cancelled`
                })
            });

            const checkout = await response.json();
            
            if (checkout.sessionId) {
                // Redirect to Stripe Checkout
                const stripe = Stripe('pk_test_your_stripe_key'); // Use your publishable key
                stripe.redirectToCheckout({ sessionId: checkout.sessionId });
            } else {
                // Handle PayPal or other payment methods
                window.location.href = checkout.approvalUrl;
            }
        } catch (error) {
            console.error('Failed to create checkout session:', error);
            this.showError('Failed to process upgrade. Please try again.');
        }
    }

    showError(message) {
        const error = document.createElement('div');
        error.className = 'subscription-error';
        error.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(error);
        
        setTimeout(() => error.remove(), 5000);
    }

    updateUI() {
        this.updateSubscriptionBadge();
        this.updateFeatureAccess();
        this.updateUsageIndicators();
        this.updateUpgradeButtons();
    }

    updateSubscriptionBadge() {
        const badge = document.querySelector('.subscription-badge');
        if (badge && this.userSubscription) {
            const tier = this.subscriptionTiers[this.userSubscription.tier];
            badge.textContent = tier.name;
            badge.className = `subscription-badge tier-${this.userSubscription.tier}`;
        }
    }

    updateFeatureAccess() {
        // Update UI elements based on feature access
        document.querySelectorAll('[data-feature]').forEach(element => {
            const feature = element.dataset.feature;
            this.checkFeatureAccess(feature).then(hasAccess => {
                if (!hasAccess) {
                    element.classList.add('feature-locked');
                    element.setAttribute('title', 'Upgrade to access this feature');
                } else {
                    element.classList.remove('feature-locked');
                    element.removeAttribute('title');
                }
            });
        });
    }

    updateUsageIndicators() {
        if (!this.userSubscription) return;

        const usage = this.userSubscription.usage;
        const tier = this.subscriptionTiers[this.userSubscription.tier];

        // Update session time indicator
        if (tier.features.sessionTimeLimit) {
            const timePercent = (usage.sessionTime / tier.features.sessionTimeLimit) * 100;
            this.updateUsageIndicator('session-time', timePercent, usage.sessionTime, tier.features.sessionTimeLimit);
        }

        // Update AI requests indicator
        if (tier.features.aiRequestsPerDay) {
            const aiPercent = (usage.aiRequestsToday / tier.features.aiRequestsPerDay) * 100;
            this.updateUsageIndicator('ai-requests', aiPercent, usage.aiRequestsToday, tier.features.aiRequestsPerDay);
        }

        // Update projects indicator
        if (tier.features.projectLimit) {
            const projectPercent = (usage.projectsCreated / tier.features.projectLimit) * 100;
            this.updateUsageIndicator('projects', projectPercent, usage.projectsCreated, tier.features.projectLimit);
        }
    }

    updateUsageIndicator(type, percent, current, max) {
        const indicator = document.querySelector(`[data-usage-indicator="${type}"]`);
        if (indicator) {
            const progressBar = indicator.querySelector('.usage-progress');
            const currentText = indicator.querySelector('.usage-current');
            const maxText = indicator.querySelector('.usage-max');

            if (progressBar) {
                progressBar.style.width = `${Math.min(percent, 100)}%`;
                progressBar.className = `usage-progress ${percent > 80 ? 'warning' : ''}`;
            }

            if (currentText) currentText.textContent = current;
            if (maxText) maxText.textContent = max;
        }
    }

    updateUpgradeButtons() {
        document.querySelectorAll('[data-upgrade-tier]').forEach(button => {
            const tierId = button.dataset.upgradeTier;
            const tier = this.subscriptionTiers[tierId];
            
            button.innerHTML = `
                <div class="tier-name">${tier.name}</div>
                <div class="tier-price">$${tier.price}<span>/month</span></div>
                ${tier.popular ? '<div class="popular-badge">Popular</div>' : ''}
            `;
            
            button.onclick = () => this.upgradeToTier(tierId);
        });
    }

    // Subscription Management UI
    showSubscriptionManagement() {
        const modal = this.createModal('⚙️ Manage Subscription', `
            <div class="subscription-management">
                <div class="current-subscription">
                    <h3>Current Subscription</h3>
                    <div class="subscription-details">
                        <div class="tier-info">
                            <span class="tier-name">${this.subscriptionTiers[this.userSubscription.tier].name}</span>
                            <span class="tier-status ${this.userSubscription.status}">${this.userSubscription.status}</span>
                        </div>
                        <div class="subscription-dates">
                            <p>Started: ${new Date(this.userSubscription.startDate).toLocaleDateString()}</p>
                            ${this.userSubscription.endDate ? `<p>Ends: ${new Date(this.userSubscription.endDate).toLocaleDateString()}</p>` : ''}
                        </div>
                    </div>
                </div>

                <div class="usage-summary">
                    <h3>Usage Summary</h3>
                    <div class="usage-grid">
                        ${this.generateUsageSummary()}
                    </div>
                </div>

                <div class="subscription-actions">
                    ${this.userSubscription.tier !== 'free' ? `
                        <button class="btn btn-secondary" onclick="subscriptionUI.cancelSubscription()">
                            Cancel Subscription
                        </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="subscriptionUI.showUpgradeOptions()">
                        Change Plan
                    </button>
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    generateUsageSummary() {
        const usage = this.userSubscription.usage;
        const tier = this.subscriptionTiers[this.userSubscription.tier];
        
        let summary = '';
        
        if (tier.features.sessionTimeLimit) {
            const percent = (usage.sessionTime / tier.features.sessionTimeLimit) * 100;
            summary += `
                <div class="usage-item">
                    <span>Session Time</span>
                    <div class="usage-bar">
                        <div class="usage-progress" style="width: ${percent}%"></div>
                    </div>
                    <span>${Math.floor(usage.sessionTime / 60)}min / ${tier.features.sessionTimeLimit / 60}min</span>
                </div>
            `;
        }
        
        if (tier.features.aiRequestsPerDay) {
            const percent = (usage.aiRequestsToday / tier.features.aiRequestsPerDay) * 100;
            summary += `
                <div class="usage-item">
                    <span>AI Requests</span>
                    <div class="usage-bar">
                        <div class="usage-progress" style="width: ${percent}%"></div>
                    </div>
                    <span>${usage.aiRequestsToday} / ${tier.features.aiRequestsPerDay}</span>
                </div>
            `;
        }
        
        if (tier.features.projectLimit) {
            const percent = (usage.projectsCreated / tier.features.projectLimit) * 100;
            summary += `
                <div class="usage-item">
                    <span>Projects</span>
                    <div class="usage-bar">
                        <div class="usage-progress" style="width: ${percent}%"></div>
                    </div>
                    <span>${usage.projectsCreated} / ${tier.features.projectLimit}</span>
                </div>
            `;
        }
        
        return summary;
    }

    async cancelSubscription() {
        if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.')) {
            try {
                const response = await fetch('/api/subscription/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: this.currentUser.id,
                        reason: 'User requested cancellation'
                    })
                });

                const result = await response.json();
                
                if (result.success) {
                    this.showSuccess('Subscription cancelled successfully');
                    this.closeModal();
                    await this.loadUserData(); // Reload subscription data
                    this.updateUI();
                } else {
                    this.showError('Failed to cancel subscription');
                }
            } catch (error) {
                console.error('Failed to cancel subscription:', error);
                this.showError('Failed to cancel subscription');
            }
        }
    }

    showUpgradeOptions() {
        this.closeModal();
        // Show upgrade modal with all available tiers
        const modal = this.createModal('🚀 Choose Your Plan', `
            <div class="upgrade-options">
                <div class="tiers-grid">
                    ${Object.entries(this.subscriptionTiers).map(([tierId, tier]) => `
                        <div class="tier-card ${tier.popular ? 'popular' : ''} ${tierId === this.userSubscription.tier ? 'current' : ''}">
                            ${tier.popular ? '<div class="popular-badge">Most Popular</div>' : ''}
                            ${tierId === this.userSubscription.tier ? '<div class="current-badge">Current Plan</div>' : ''}
                            <div class="tier-header">
                                <h3>${tier.name}</h3>
                                <div class="tier-price">$${tier.price}<span>/month</span></div>
                            </div>
                            <div class="tier-features">
                                ${Object.entries(tier.features).map(([feature, enabled]) => `
                                    <div class="feature-item ${enabled ? 'enabled' : 'disabled'}">
                                        <span class="feature-icon">${enabled ? '✅' : '❌'}</span>
                                        <span class="feature-name">${this.getFeatureDisplayName(feature)}</span>
                                    </div>
                                `).join('')}
                            </div>
                            ${tierId !== this.userSubscription.tier ? `
                                <button class="btn btn-primary" onclick="subscriptionUI.upgradeToTier('${tierId}')">
                                    ${tier.price === 0 ? 'Get Started' : 'Upgrade'}
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `);
        
        document.body.appendChild(modal);
    }

    showSuccess(message) {
        const success = document.createElement('div');
        success.className = 'subscription-success';
        success.innerHTML = `
            <div class="success-content">
                <span class="success-icon">✅</span>
                <span class="success-message">${message}</span>
                <button class="success-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(success);
        
        setTimeout(() => success.remove(), 5000);
    }
}

// Initialize subscription UI
let subscriptionUI;
document.addEventListener('DOMContentLoaded', () => {
    subscriptionUI = new SubscriptionUI();
});

// Add CSS styles
const subscriptionStyles = `
<style>
.subscription-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
}

.modal-container {
    position: relative;
    background: var(--bg-primary);
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
    margin: 0;
    color: var(--text-primary);
}

.modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    transition: background-color 0.2s;
}

.modal-close:hover {
    background: var(--bg-secondary);
}

.modal-body {
    padding: 24px;
}

.limit-modal-content,
.upgrade-modal-content {
    text-align: center;
}

.limit-icon,
.upgrade-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.limit-modal-content h3,
.upgrade-modal-content h3 {
    margin: 0 0 16px 0;
    color: var(--text-primary);
}

.upgrade-features {
    text-align: left;
    margin: 24px 0;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
}

.upgrade-features h4 {
    margin: 0 0 12px 0;
    color: var(--text-primary);
}

.upgrade-features ul {
    margin: 0;
    padding: 0;
    list-style: none;
}

.upgrade-features li {
    padding: 8px 0;
    color: var(--text-secondary);
}

.pricing-info {
    margin: 24px 0;
    text-align: center;
}

.price {
    font-size: 32px;
    font-weight: bold;
    color: var(--accent-primary);
}

.price span {
    font-size: 16px;
    color: var(--text-secondary);
}

.savings {
    color: var(--success-color);
    font-weight: 500;
    margin-top: 8px;
}

.modal-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 24px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: var(--accent-primary);
    color: white;
}

.btn-primary:hover {
    background: var(--accent-primary-dark);
    transform: translateY(-1px);
}

.btn-secondary {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
}

.subscription-error,
.subscription-success {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10001;
    max-width: 400px;
}

.error-content,
.success-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-content {
    background: var(--error-color);
    color: white;
}

.success-content {
    background: var(--success-color);
    color: white;
}

.error-close,
.success-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    margin-left: auto;
}

.feature-locked {
    opacity: 0.6;
    position: relative;
}

.feature-locked::after {
    content: '🔒';
    position: absolute;
    top: 8px;
    right: 8px;
    font-size: 16px;
}

.usage-indicator {
    margin: 8px 0;
}

.usage-bar {
    width: 100%;
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
    overflow: hidden;
    margin: 4px 0;
}

.usage-progress {
    height: 100%;
    background: var(--accent-primary);
    transition: width 0.3s ease;
}

.usage-progress.warning {
    background: var(--warning-color);
}

.subscription-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    text-transform: uppercase;
}

.tier-free { background: var(--bg-secondary); color: var(--text-secondary); }
.tier-starter { background: var(--info-color); color: white; }
.tier-professional { background: var(--accent-primary); color: white; }
.tier-enterprise { background: var(--premium-color); color: white; }

.tiers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin: 24px 0;
}

.tier-card {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 24px;
    position: relative;
    border: 2px solid var(--border-color);
    transition: all 0.2s;
}

.tier-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.tier-card.popular {
    border-color: var(--accent-primary);
    transform: scale(1.05);
}

.tier-card.current {
    border-color: var(--success-color);
}

.popular-badge,
.current-badge {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
}

.popular-badge {
    background: var(--accent-primary);
    color: white;
}

.current-badge {
    background: var(--success-color);
    color: white;
}

.tier-header {
    text-align: center;
    margin-bottom: 20px;
}

.tier-header h3 {
    margin: 0 0 8px 0;
    color: var(--text-primary);
}

.tier-features {
    margin: 20px 0;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
}

.feature-item.enabled {
    color: var(--text-primary);
}

.feature-item.disabled {
    color: var(--text-secondary);
    opacity: 0.6;
}

.feature-icon {
    font-size: 14px;
}

.feature-name {
    font-size: 14px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', subscriptionStyles);
