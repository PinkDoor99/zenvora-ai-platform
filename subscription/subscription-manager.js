/**
 * Zenvora AI Platform - Subscription & Payment Manager
 * Complete tiered subscription system with payment processing
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const paypal = require('@paypal/checkout-server-sdk');
const { EventEmitter } = require('events');

class SubscriptionManager extends EventEmitter {
    constructor() {
        super();
        this.subscriptionTiers = this.initializeSubscriptionTiers();
        this.userSubscriptions = new Map();
        this.usageTrackers = new Map();
        this.paymentMethods = new Map();
        
        // Initialize PayPal SDK
        this.paypalClient = new paypal.core.PayPalHttpClient(
            this.getPayPalEnvironment()
        );
    }

    initializeSubscriptionTiers() {
        return {
            free: {
                id: 'free',
                name: 'Free',
                price: 0,
                billingCycle: 'monthly',
                features: {
                    // Code Editor
                    codeEditor: true,
                    codeExecution: true,
                    codeAnalysis: false,
                    
                    // AI Tools
                    aiCodeGeneration: false,
                    aiSecurityScan: false,
                    aiPerformanceOptimization: false,
                    aiDocumentation: false,
                    
                    // Learning
                    basicLessons: true,
                    advancedLessons: false,
                    expertLessons: false,
                    certificates: false,
                    
                    // Collaboration
                    basicCollaboration: true,
                    advancedCollaboration: false,
                    voiceCalls: false,
                    videoCalls: false,
                    
                    // Storage & Limits
                    codeStorage: '100MB',
                    projectLimit: 3,
                    aiRequestsPerDay: 0,
                    sessionTimeLimit: 1800, // 30 minutes in seconds
                    collaborationUsers: 2,
                    
                    // Support
                    supportLevel: 'community',
                    apiAccess: false,
                    exportData: false
                },
                stripePriceId: null,
                paypalPlanId: null,
                popular: false
            },
            
            starter: {
                id: 'starter',
                name: 'Starter',
                price: 9.99,
                billingCycle: 'monthly',
                features: {
                    // Code Editor
                    codeEditor: true,
                    codeExecution: true,
                    codeAnalysis: true,
                    
                    // AI Tools
                    aiCodeGeneration: true,
                    aiSecurityScan: false,
                    aiPerformanceOptimization: false,
                    aiDocumentation: false,
                    
                    // Learning
                    basicLessons: true,
                    advancedLessons: true,
                    expertLessons: false,
                    certificates: false,
                    
                    // Collaboration
                    basicCollaboration: true,
                    advancedCollaboration: true,
                    voiceCalls: false,
                    videoCalls: false,
                    
                    // Storage & Limits
                    codeStorage: '1GB',
                    projectLimit: 10,
                    aiRequestsPerDay: 50,
                    sessionTimeLimit: 3600, // 1 hour in seconds
                    collaborationUsers: 5,
                    
                    // Support
                    supportLevel: 'email',
                    apiAccess: false,
                    exportData: true
                },
                stripePriceId: 'price_starter_monthly',
                paypalPlanId: 'P-STARTER-MONTHLY',
                popular: false
            },
            
            professional: {
                id: 'professional',
                name: 'Professional',
                price: 19.99,
                billingCycle: 'monthly',
                features: {
                    // Code Editor
                    codeEditor: true,
                    codeExecution: true,
                    codeAnalysis: true,
                    
                    // AI Tools
                    aiCodeGeneration: true,
                    aiSecurityScan: true,
                    aiPerformanceOptimization: true,
                    aiDocumentation: true,
                    
                    // Learning
                    basicLessons: true,
                    advancedLessons: true,
                    expertLessons: true,
                    certificates: true,
                    
                    // Collaboration
                    basicCollaboration: true,
                    advancedCollaboration: true,
                    voiceCalls: true,
                    videoCalls: false,
                    
                    // Storage & Limits
                    codeStorage: '5GB',
                    projectLimit: 50,
                    aiRequestsPerDay: 500,
                    sessionTimeLimit: null, // unlimited
                    collaborationUsers: 20,
                    
                    // Support
                    supportLevel: 'priority',
                    apiAccess: true,
                    exportData: true
                },
                stripePriceId: 'price_professional_monthly',
                paypalPlanId: 'P-PROFESSIONAL-MONTHLY',
                popular: true
            },
            
            enterprise: {
                id: 'enterprise',
                name: 'Enterprise',
                price: 49.99,
                billingCycle: 'monthly',
                features: {
                    // Code Editor
                    codeEditor: true,
                    codeExecution: true,
                    codeAnalysis: true,
                    
                    // AI Tools
                    aiCodeGeneration: true,
                    aiSecurityScan: true,
                    aiPerformanceOptimization: true,
                    aiDocumentation: true,
                    
                    // Learning
                    basicLessons: true,
                    advancedLessons: true,
                    expertLessons: true,
                    certificates: true,
                    
                    // Collaboration
                    basicCollaboration: true,
                    advancedCollaboration: true,
                    voiceCalls: true,
                    videoCalls: true,
                    
                    // Storage & Limits
                    codeStorage: '100GB',
                    projectLimit: null, // unlimited
                    aiRequestsPerDay: null, // unlimited
                    sessionTimeLimit: null, // unlimited
                    collaborationUsers: null, // unlimited
                    
                    // Support
                    supportLevel: 'dedicated',
                    apiAccess: true,
                    exportData: true,
                    
                    // Enterprise Features
                    ssoIntegration: true,
                    customBranding: true,
                    advancedAnalytics: true,
                    prioritySupport: true,
                    customIntegrations: true
                },
                stripePriceId: 'price_enterprise_monthly',
                paypalPlanId: 'P-ENTERPRISE-MONTHLY',
                popular: false
            }
        };
    }

    getPayPalEnvironment() {
        if (process.env.NODE_ENV === 'production') {
            return paypal.core.LiveEnvironment;
        }
        return paypal.core.SandboxEnvironment(
            process.env.PAYPAL_CLIENT_ID,
            process.env.PAYPAL_CLIENT_SECRET
        );
    }

    // User Subscription Management
    async getUserSubscription(userId) {
        if (this.userSubscriptions.has(userId)) {
            return this.userSubscriptions.get(userId);
        }

        // In production, this would query the database
        const subscription = await this.loadUserSubscriptionFromDB(userId);
        this.userSubscriptions.set(userId, subscription);
        return subscription;
    }

    async loadUserSubscriptionFromDB(userId) {
        // Mock implementation - in production, query database
        return {
            userId,
            tier: 'free',
            status: 'active',
            startDate: new Date(),
            endDate: null,
            autoRenew: false,
            paymentMethod: null,
            stripeCustomerId: null,
            paypalSubscriptionId: null,
            usage: {
                sessionTime: 0,
                aiRequestsToday: 0,
                projectsCreated: 0,
                storageUsed: 0
            }
        };
    }

    async updateUserSubscription(userId, subscriptionData) {
        this.userSubscriptions.set(userId, subscriptionData);
        await this.saveUserSubscriptionToDB(userId, subscriptionData);
        this.emit('subscriptionUpdated', { userId, subscription: subscriptionData });
    }

    async saveUserSubscriptionToDB(userId, subscriptionData) {
        // Mock implementation - in production, save to database
        console.log(`Saving subscription for user ${userId}:`, subscriptionData);
    }

    // Feature Access Control
    async hasFeatureAccess(userId, feature) {
        const subscription = await this.getUserSubscription(userId);
        
        if (!subscription || subscription.status !== 'active') {
            return false;
        }

        const tier = this.subscriptionTiers[subscription.tier];
        return tier.features[feature] || false;
    }

    async checkUsageLimits(userId, feature, usageAmount = 1) {
        const subscription = await this.getUserSubscription(userId);
        const tier = this.subscriptionTiers[subscription.tier];
        
        // Check time limits for free tier
        if (subscription.tier === 'free' && tier.features.sessionTimeLimit) {
            const sessionTime = subscription.usage.sessionTime + usageAmount;
            if (sessionTime > tier.features.sessionTimeLimit) {
                return {
                    allowed: false,
                    reason: 'time_limit_exceeded',
                    message: `Free tier limited to ${tier.features.sessionTimeLimit / 60} minutes. Upgrade to continue.`,
                    upgradeTier: 'starter'
                };
            }
        }

        // Check AI request limits
        if (feature === 'aiRequests' && tier.features.aiRequestsPerDay !== null) {
            const todayUsage = subscription.usage.aiRequestsToday + usageAmount;
            if (todayUsage > tier.features.aiRequestsPerDay) {
                return {
                    allowed: false,
                    reason: 'ai_limit_exceeded',
                    message: `Daily AI request limit of ${tier.features.aiRequestsPerDay} reached. Upgrade for more.`,
                    upgradeTier: subscription.tier === 'starter' ? 'professional' : 'enterprise'
                };
            }
        }

        // Check project limits
        if (feature === 'projects' && tier.features.projectLimit !== null) {
            const projectCount = subscription.usage.projectsCreated + usageAmount;
            if (projectCount > tier.features.projectLimit) {
                return {
                    allowed: false,
                    reason: 'project_limit_exceeded',
                    message: `Project limit of ${tier.features.projectLimit} reached. Upgrade for more projects.`,
                    upgradeTier: subscription.tier === 'starter' ? 'professional' : 'enterprise'
                };
            }
        }

        return { allowed: true };
    }

    async trackUsage(userId, feature, amount = 1) {
        const subscription = await this.getUserSubscription(userId);
        
        switch (feature) {
            case 'sessionTime':
                subscription.usage.sessionTime += amount;
                break;
            case 'aiRequests':
                subscription.usage.aiRequestsToday += amount;
                break;
            case 'projects':
                subscription.usage.projectsCreated += amount;
                break;
            case 'storage':
                subscription.usage.storageUsed += amount;
                break;
        }

        await this.updateUserSubscription(userId, subscription);
        this.emit('usageTracked', { userId, feature, amount, totalUsage: subscription.usage });
    }

    // Payment Processing - Stripe
    async createStripeCheckoutSession(userId, tierId, successUrl, cancelUrl) {
        const tier = this.subscriptionTiers[tierId];
        if (!tier || tier.price === 0) {
            throw new Error('Invalid tier for payment');
        }

        const user = await this.getUserSubscription(userId);
        
        try {
            const session = await stripe.checkout.sessions.create({
                customer_email: user.email,
                billing_address_collection: 'required',
                payment_method_types: ['card'],
                mode: 'subscription',
                line_items: [{
                    price: tier.stripePriceId,
                    quantity: 1,
                }],
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: userId,
                    tierId: tierId
                },
                subscription_data: {
                    metadata: {
                        userId: userId,
                        tierId: tierId
                    }
                }
            });

            return { sessionId: session.id, url: session.url };
        } catch (error) {
            console.error('Stripe checkout error:', error);
            throw new Error('Failed to create checkout session');
        }
    }

    async handleStripeWebhook(event) {
        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleStripeCheckoutCompleted(event.data.object);
                break;
            case 'invoice.payment_succeeded':
                await this.handleStripePaymentSucceeded(event.data.object);
                break;
            case 'invoice.payment_failed':
                await this.handleStripePaymentFailed(event.data.object);
                break;
            case 'customer.subscription.deleted':
                await this.handleStripeSubscriptionCancelled(event.data.object);
                break;
        }
    }

    async handleStripeCheckoutCompleted(session) {
        const { userId, tierId } = session.metadata;
        const subscription = await this.getUserSubscription(userId);
        
        // Update subscription
        subscription.tier = tierId;
        subscription.status = 'active';
        subscription.stripeCustomerId = session.customer;
        subscription.stripeSubscriptionId = session.subscription;
        subscription.paymentMethod = 'stripe';
        subscription.startDate = new Date();
        subscription.autoRenew = true;

        await this.updateUserSubscription(userId, subscription);
        this.emit('subscriptionCreated', { userId, tierId, provider: 'stripe' });
    }

    async handleStripePaymentSucceeded(invoice) {
        const subscriptionId = invoice.subscription;
        // Update subscription end date, send confirmation, etc.
        this.emit('paymentSucceeded', { subscriptionId, provider: 'stripe' });
    }

    async handleStripePaymentFailed(invoice) {
        const subscriptionId = invoice.subscription;
        // Handle payment failure, send notification, etc.
        this.emit('paymentFailed', { subscriptionId, provider: 'stripe' });
    }

    async handleStripeSubscriptionCancelled(subscription) {
        const userId = subscription.metadata.userId;
        const userSubscription = await this.getUserSubscription(userId);
        
        userSubscription.status = 'cancelled';
        userSubscription.endDate = new Date();
        userSubscription.autoRenew = false;

        await this.updateUserSubscription(userId, userSubscription);
        this.emit('subscriptionCancelled', { userId, provider: 'stripe' });
    }

    // Payment Processing - PayPal
    async createPayPalSubscription(userId, tierId, returnUrl, cancelUrl) {
        const tier = this.subscriptionTiers[tierId];
        if (!tier || tier.price === 0) {
            throw new Error('Invalid tier for payment');
        }

        const request = new paypal.subscriptions.SubscriptionsCreateRequest();
        request.requestBody({
            intent: 'SUBSCRIPTION',
            plan_id: tier.paypalPlanId,
            application_context: {
                return_url: returnUrl,
                cancel_url: cancelUrl,
                brand_name: 'Zenvora AI Platform',
                locale: 'en-US',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                payment_method: {
                    payer_selected: 'PAYPAL',
                    payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED'
                }
            },
            custom_id: userId
        });

        try {
            const response = await this.paypalClient.execute(request);
            const approvalUrl = response.result.links.find(link => link.rel === 'approve').href;
            
            return { 
                subscriptionId: response.result.id, 
                approvalUrl 
            };
        } catch (error) {
            console.error('PayPal subscription error:', error);
            throw new Error('Failed to create PayPal subscription');
        }
    }

    async handlePayPalWebhook(event) {
        switch (event.event_type) {
            case 'BILLING.SUBSCRIPTION.ACTIVATED':
                await this.handlePayPalSubscriptionActivated(event.resource);
                break;
            case 'PAYMENT.SALE.COMPLETED':
                await this.handlePayPalPaymentCompleted(event.resource);
                break;
            case 'BILLING.SUBSCRIPTION.CANCELLED':
                await this.handlePayPalSubscriptionCancelled(event.resource);
                break;
        }
    }

    async handlePayPalSubscriptionActivated(subscription) {
        const userId = subscription.custom_id;
        const tierId = this.getTierIdFromPayPalPlan(subscription.plan_id);
        
        const userSubscription = await this.getUserSubscription(userId);
        userSubscription.tier = tierId;
        userSubscription.status = 'active';
        userSubscription.paypalSubscriptionId = subscription.id;
        userSubscription.paymentMethod = 'paypal';
        userSubscription.startDate = new Date();
        userSubscription.autoRenew = true;

        await this.updateUserSubscription(userId, userSubscription);
        this.emit('subscriptionCreated', { userId, tierId, provider: 'paypal' });
    }

    async handlePayPalPaymentCompleted(payment) {
        // Handle successful PayPal payment
        this.emit('paymentSucceeded', { paymentId: payment.id, provider: 'paypal' });
    }

    async handlePayPalSubscriptionCancelled(subscription) {
        const userId = subscription.custom_id;
        const userSubscription = await this.getUserSubscription(userId);
        
        userSubscription.status = 'cancelled';
        userSubscription.endDate = new Date();
        userSubscription.autoRenew = false;

        await this.updateUserSubscription(userId, userSubscription);
        this.emit('subscriptionCancelled', { userId, provider: 'paypal' });
    }

    getTierIdFromPayPalPlan(planId) {
        for (const [tierId, tier] of Object.entries(this.subscriptionTiers)) {
            if (tier.paypalPlanId === planId) {
                return tierId;
            }
        }
        return 'free';
    }

    // Subscription Management
    async upgradeSubscription(userId, newTierId) {
        const currentSubscription = await this.getUserSubscription(userId);
        const newTier = this.subscriptionTiers[newTierId];
        
        if (!newTier) {
            throw new Error('Invalid tier');
        }

        // For free tier upgrades, create new subscription
        if (currentSubscription.paymentMethod === null || currentSubscription.tier === 'free') {
            return { needsPayment: true, tier: newTier };
        }

        // For existing paid subscriptions, update via payment provider
        if (currentSubscription.paymentMethod === 'stripe') {
            return await this.updateStripeSubscription(userId, currentSubscription.stripeSubscriptionId, newTierId);
        } else if (currentSubscription.paymentMethod === 'paypal') {
            return await this.updatePayPalSubscription(userId, currentSubscription.paypalSubscriptionId, newTierId);
        }
    }

    async updateStripeSubscription(userId, subscriptionId, newTierId) {
        try {
            const newTier = this.subscriptionTiers[newTierId];
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            
            const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: newTier.stripePriceId,
                }],
                proration_behavior: 'create_prorations'
            });

            const userSubscription = await this.getUserSubscription(userId);
            userSubscription.tier = newTierId;
            await this.updateUserSubscription(userId, userSubscription);
            
            this.emit('subscriptionUpgraded', { userId, newTierId, provider: 'stripe' });
            return { success: true, subscription: updatedSubscription };
        } catch (error) {
            console.error('Stripe subscription update error:', error);
            throw new Error('Failed to update subscription');
        }
    }

    async cancelSubscription(userId, reason = '') {
        const subscription = await this.getUserSubscription(userId);
        
        if (subscription.paymentMethod === 'stripe' && subscription.stripeSubscriptionId) {
            await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
        } else if (subscription.paymentMethod === 'paypal' && subscription.paypalSubscriptionId) {
            await this.cancelPayPalSubscription(subscription.paypalSubscriptionId);
        }

        subscription.status = 'cancelled';
        subscription.endDate = new Date();
        subscription.autoRenew = false;
        subscription.cancellationReason = reason;

        await this.updateUserSubscription(userId, subscription);
        this.emit('subscriptionCancelled', { userId, reason, provider: subscription.paymentMethod });
        
        return { success: true };
    }

    async cancelPayPalSubscription(subscriptionId) {
        const request = new paypal.subscriptions.SubscriptionsCancelRequest(subscriptionId);
        request.requestBody({
            reason: 'User requested cancellation'
        });

        await this.paypalClient.execute(request);
    }

    // Analytics and Reporting
    async getSubscriptionStats() {
        const stats = {
            totalUsers: 0,
            activeSubscriptions: {},
            revenue: {
                monthly: 0,
                annual: 0
            },
            churnRate: 0,
            conversionRate: 0
        };

        // In production, this would query the database
        for (const tierId of Object.keys(this.subscriptionTiers)) {
            stats.activeSubscriptions[tierId] = 0;
        }

        return stats;
    }

    async getRevenueReport(startDate, endDate) {
        // Generate revenue report for date range
        return {
            period: { startDate, endDate },
            totalRevenue: 0,
            revenueByTier: {},
            newSubscriptions: {},
            cancellations: {},
            mrr: 0,
            arr: 0
        };
    }

    // Express.js Routes
    getRoutes() {
        const router = require('express').Router();

        // Get subscription tiers
        router.get('/tiers', (req, res) => {
            res.json(this.subscriptionTiers);
        });

        // Get user subscription
        router.get('/user/:userId', async (req, res) => {
            try {
                const { userId } = req.params;
                const subscription = await this.getUserSubscription(userId);
                res.json(subscription);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Check feature access
        router.post('/check-access', async (req, res) => {
            try {
                const { userId, feature } = req.body;
                const hasAccess = await this.hasFeatureAccess(userId, feature);
                res.json({ hasAccess });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Check usage limits
        router.post('/check-limits', async (req, res) => {
            try {
                const { userId, feature, amount } = req.body;
                const limitCheck = await this.checkUsageLimits(userId, feature, amount);
                res.json(limitCheck);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Track usage
        router.post('/track-usage', async (req, res) => {
            try {
                const { userId, feature, amount } = req.body;
                await this.trackUsage(userId, feature, amount);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Create Stripe checkout
        router.post('/stripe/checkout', async (req, res) => {
            try {
                const { userId, tierId, successUrl, cancelUrl } = req.body;
                const checkout = await this.createStripeCheckoutSession(userId, tierId, successUrl, cancelUrl);
                res.json(checkout);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Create PayPal subscription
        router.post('/paypal/subscribe', async (req, res) => {
            try {
                const { userId, tierId, returnUrl, cancelUrl } = req.body;
                const subscription = await this.createPayPalSubscription(userId, tierId, returnUrl, cancelUrl);
                res.json(subscription);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Upgrade subscription
        router.post('/upgrade', async (req, res) => {
            try {
                const { userId, newTierId } = req.body;
                const result = await this.upgradeSubscription(userId, newTierId);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Cancel subscription
        router.post('/cancel', async (req, res) => {
            try {
                const { userId, reason } = req.body;
                const result = await this.cancelSubscription(userId, reason);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Webhook endpoints
        router.post('/stripe/webhook', async (req, res) => {
            try {
                const sig = req.headers['stripe-signature'];
                const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
                await this.handleStripeWebhook(event);
                res.json({ received: true });
            } catch (error) {
                console.error('Stripe webhook error:', error);
                res.status(400).json({ error: 'Webhook signature verification failed' });
            }
        });

        router.post('/paypal/webhook', async (req, res) => {
            try {
                await this.handlePayPalWebhook(req.body);
                res.json({ received: true });
            } catch (error) {
                console.error('PayPal webhook error:', error);
                res.status(400).json({ error: 'Webhook processing failed' });
            }
        });

        // Analytics endpoints
        router.get('/stats', async (req, res) => {
            try {
                const stats = await this.getSubscriptionStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.get('/revenue', async (req, res) => {
            try {
                const { startDate, endDate } = req.query;
                const report = await this.getRevenueReport(
                    new Date(startDate),
                    new Date(endDate)
                );
                res.json(report);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        return router;
    }
}

module.exports = SubscriptionManager;
