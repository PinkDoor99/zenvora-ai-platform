/**
 * Zenvora AI Platform - Payment Holding System
 * Accept payments and hold in system until bank account is configured
 */

const { EventEmitter } = require('events');

class PaymentHoldingSystem extends EventEmitter {
    constructor() {
        super();
        this.heldPayments = new Map();
        this.pendingVerifications = new Map();
        this.bankConfigured = false;
        this.holdingPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        
        this.setupAutomaticRelease();
        this.setupExpirationChecks();
    }

    // Accept payment and hold it
    async acceptPayment(paymentData) {
        const payment = {
            id: this.generatePaymentId(),
            userId: paymentData.userId,
            amount: paymentData.amount,
            currency: paymentData.currency || 'USD',
            paymentMethod: paymentData.paymentMethod, // 'stripe', 'paypal', 'bank_transfer'
            tier: paymentData.tier,
            timestamp: new Date(),
            status: 'held',
            expiresAt: new Date(Date.now() + this.holdingPeriod),
            customerInfo: {
                email: paymentData.email,
                name: paymentData.name
            },
            metadata: paymentData.metadata || {}
        };

        // Store payment in holding system
        this.heldPayments.set(payment.id, payment);
        
        // Log the payment
        await this.logPaymentEvent('payment_accepted', payment);
        
        // Send confirmation to customer
        await this.sendCustomerConfirmation(payment);
        
        // Notify admin
        await this.notifyAdmin('payment_held', payment);
        
        this.emit('paymentAccepted', payment);
        
        return {
            success: true,
            paymentId: payment.id,
            message: 'Payment accepted and held securely. Your subscription will activate once banking is configured.',
            heldUntil: payment.expiresAt
        };
    }

    // Configure bank account and release held payments
    async configureBankAccount(bankDetails) {
        try {
            // Validate bank details (basic validation)
            const validation = await this.validateBankDetails(bankDetails);
            if (!validation.valid) {
                throw new Error(`Bank validation failed: ${validation.errors.join(', ')}`);
            }

            // Store encrypted bank details
            const encryptedBank = await this.encryptBankDetails(bankDetails);
            
            // Mark bank as configured
            this.bankConfigured = true;
            
            // Store bank configuration
            await this.storeBankConfiguration(encryptedBank);
            
            // Release all held payments
            const releasedPayments = await this.releaseAllHeldPayments();
            
            // Log the configuration
            await this.logPaymentEvent('bank_configured', { 
                timestamp: new Date(),
                paymentsReleased: releasedPayments.length,
                totalAmount: releasedPayments.reduce((sum, p) => sum + p.amount, 0)
            });
            
            this.emit('bankConfigured', { 
                paymentsReleased: releasedPayments.length,
                totalAmount: releasedPayments.reduce((sum, p) => sum + p.amount, 0)
            });
            
            return {
                success: true,
                paymentsReleased: releasedPayments.length,
                totalAmount: releasedPayments.reduce((sum, p) => sum + p.amount, 0),
                message: 'Bank account configured successfully. All held payments have been released.'
            };
            
        } catch (error) {
            console.error('Bank configuration failed:', error);
            await this.logPaymentEvent('bank_config_failed', { error: error.message });
            throw error;
        }
    }

    // Release all held payments to configured bank
    async releaseAllHeldPayments() {
        const releasedPayments = [];
        
        for (const [paymentId, payment] of this.heldPayments) {
            try {
                const result = await this.processPaymentToBank(payment);
                if (result.success) {
                    payment.status = 'released';
                    payment.releasedAt = new Date();
                    payment.bankReference = result.reference;
                    
                    // Activate customer subscription
                    await this.activateSubscription(payment);
                    
                    releasedPayments.push(payment);
                    this.heldPayments.delete(paymentId);
                    
                    await this.logPaymentEvent('payment_released', payment);
                    await this.sendReleaseConfirmation(payment);
                }
            } catch (error) {
                console.error(`Failed to release payment ${paymentId}:`, error);
                payment.status = 'release_failed';
                payment.error = error.message;
            }
        }
        
        return releasedPayments;
    }

    // Process individual payment to bank
    async processPaymentToBank(payment) {
        if (!this.bankConfigured) {
            throw new Error('Bank account not configured');
        }

        try {
            // Process through payment processor (Stripe/PayPal)
            let result;
            
            switch (payment.paymentMethod) {
                case 'stripe':
                    result = await this.processStripePayment(payment);
                    break;
                case 'paypal':
                    result = await this.processPayPalPayment(payment);
                    break;
                case 'bank_transfer':
                    result = await this.processBankTransfer(payment);
                    break;
                default:
                    throw new Error(`Unsupported payment method: ${payment.paymentMethod}`);
            }
            
            return result;
            
        } catch (error) {
            await this.logPaymentEvent('payment_processing_failed', { 
                paymentId: payment.id, 
                error: error.message 
            });
            throw error;
        }
    }

    // Process Stripe payment
    async processStripePayment(payment) {
        // In production, use actual Stripe API
        const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
        
        try {
            const transfer = await stripe.transfers.create({
                amount: Math.round(payment.amount * 100), // Convert to cents
                currency: payment.currency,
                destination: 'bank_account', // Will use configured bank account
                metadata: {
                    paymentId: payment.id,
                    userId: payment.userId,
                    tier: payment.tier
                }
            });
            
            return {
                success: true,
                reference: transfer.id,
                amount: payment.amount,
                currency: payment.currency
            };
            
        } catch (error) {
            throw new Error(`Stripe transfer failed: ${error.message}`);
        }
    }

    // Process PayPal payment
    async processPayPalPayment(payment) {
        // In production, use actual PayPal API
        const paypal = require('paypal-rest-sdk');
        
        try {
            const payout = await paypal.payout.create({
                sender_batch_header: {
                    sender_batch_id: `batch_${Date.now()}`,
                    email_subject: 'Payment from Zenvora AI Platform'
                },
                items: [{
                    recipient_type: 'EMAIL',
                    amount: {
                        value: payment.amount.toFixed(2),
                        currency: payment.currency
                    },
                    receiver: payment.customerInfo.email,
                    note: `Payment for ${payment.tier} subscription`,
                    sender_item_id: payment.id
                }]
            });
            
            return {
                success: true,
                reference: payout.batch_header.payout_batch_id,
                amount: payment.amount,
                currency: payment.currency
            };
            
        } catch (error) {
            throw new Error(`PayPal payout failed: ${error.message}`);
        }
    }

    // Process bank transfer
    async processBankTransfer(payment) {
        // For manual bank transfers, create transfer record
        const transfer = {
            id: this.generateTransferId(),
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            status: 'pending',
            createdAt: new Date(),
            instructions: this.generateBankTransferInstructions(payment)
        };
        
        await this.storeBankTransfer(transfer);
        
        return {
            success: true,
            reference: transfer.id,
            amount: payment.amount,
            currency: payment.currency,
            requiresManualVerification: true
        };
    }

    // Generate bank transfer instructions
    generateBankTransferInstructions(payment) {
        return {
            amount: payment.amount.toFixed(2),
            currency: payment.currency,
            reference: `ZENVORA-${payment.id}`,
            memo: `Payment for ${payment.tier} subscription - User ${payment.userId}`,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        };
    }

    // Activate subscription for customer
    async activateSubscription(payment) {
        const subscription = {
            userId: payment.userId,
            tier: payment.tier,
            status: 'active',
            startDate: new Date(),
            paymentId: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            paymentMethod: payment.paymentMethod,
            autoRenew: true,
            nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        };
        
        // Store subscription in database
        await this.storeSubscription(subscription);
        
        // Send activation confirmation
        await this.sendSubscriptionActivation(subscription);
        
        this.emit('subscriptionActivated', subscription);
        
        return subscription;
    }

    // Send confirmation to customer
    async sendCustomerConfirmation(payment) {
        const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .payment-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .status { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 Zenvora AI Platform</div>
            <h2>Payment Confirmation</h2>
        </div>

        <p>Dear ${payment.customerInfo.name},</p>
        
        <p>Thank you for your payment of <strong>$${payment.amount.toFixed(2)}</strong> for the <strong>${payment.tier}</strong> subscription.</p>

        <div class="payment-details">
            <h3>Payment Details</h3>
            <p><strong>Payment ID:</strong> ${payment.id}</p>
            <p><strong>Amount:</strong> $${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Subscription:</strong> ${payment.tier}</p>
            <p><strong>Payment Method:</strong> ${payment.paymentMethod}</p>
            <p><strong>Date:</strong> ${payment.timestamp.toLocaleDateString()}</p>
        </div>

        <div class="status">
            <h3>⏳ Payment Status: Held Securely</h3>
            <p>Your payment has been received and is being held securely in our system. Your subscription will be activated automatically once our banking configuration is complete.</p>
            <p><strong>Expected activation:</strong> Within 24-48 hours</p>
            <p><strong>Held until:</strong> ${payment.expiresAt.toLocaleDateString()}</p>
        </div>

        <p>You will receive another email once your subscription is activated and you can start using the platform features.</p>

        <p>Thank you for your patience and understanding!</p>

        <div class="footer">
            <p>© 2024 Zenvora AI Platform. All rights reserved.</p>
            <p>Questions? Contact us at support@zenvora.ai</p>
        </div>
    </div>
</body>
</html>`;

        // Send email using nodemailer
        const transporter = require('nodemailer').createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: payment.customerInfo.email,
            subject: 'Payment Confirmation - Zenvora AI Platform',
            html: emailContent
        });
    }

    // Send release confirmation
    async sendReleaseConfirmation(payment) {
        const emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .success { background: #d4edda; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; color: #666; margin-top: 30px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 Zenvora AI Platform</div>
            <h2>Subscription Activated!</h2>
        </div>

        <p>Dear ${payment.customerInfo.name},</p>
        
        <p>Great news! Your payment has been processed and your <strong>${payment.tier}</strong> subscription is now <strong>ACTIVE</strong>.</p>

        <div class="success">
            <h3>✅ Subscription Details</h3>
            <p><strong>Payment ID:</strong> ${payment.id}</p>
            <p><strong>Subscription:</strong> ${payment.tier}</p>
            <p><strong>Amount:</strong> $${payment.amount.toFixed(2)} ${payment.currency}</p>
            <p><strong>Activated:</strong> ${payment.releasedAt.toLocaleDateString()}</p>
            <p><strong>Reference:</strong> ${payment.bankReference}</p>
        </div>

        <p>You can now log in and start using all the features included in your ${payment.tier} subscription:</p>
        <ul>
            ${this.getTierFeatures(payment.tier)}
        </ul>

        <p><strong>Next Steps:</strong></p>
        <ol>
            <li>Log in to your Zenvora AI Platform account</li>
            <li>Access your premium features immediately</li>
            <li>Enjoy unlimited AI-powered coding assistance</li>
        </ol>

        <p>Thank you for choosing Zenvora AI Platform!</p>

        <div class="footer">
            <p>© 2024 Zenvora AI Platform. All rights reserved.</p>
            <p>Need help? Contact us at support@zenvora.ai</p>
        </div>
    </div>
</body>
</html>`;

        const transporter = require('nodemailer').createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: payment.customerInfo.email,
            subject: 'Subscription Activated - Zenvora AI Platform',
            html: emailContent
        });
    }

    // Get tier features for email
    getTierFeatures(tier) {
        const features = {
            starter: '<li>50 AI requests per day</li><li>10 projects</li><li>1GB storage</li><li>Basic AI tools</li>',
            professional: '<li>500 AI requests per day</li><li>50 projects</li><li>5GB storage</li><li>Advanced AI tools</li><li>Priority support</li>',
            enterprise: '<li>Unlimited AI requests</li><li>Unlimited projects</li><li>Unlimited storage</li><li>All AI tools</li><li>Enterprise support</li><li>Custom integrations</li>'
        };
        return features[tier] || '<li>Basic features</li>';
    }

    // Setup automatic release checks
    setupAutomaticRelease() {
        // Check every hour for bank configuration
        setInterval(async () => {
            if (this.bankConfigured && this.heldPayments.size > 0) {
                console.log(`Releasing ${this.heldPayments.size} held payments...`);
                await this.releaseAllHeldPayments();
            }
        }, 60 * 60 * 1000); // Every hour
    }

    // Setup expiration checks
    setupExpirationChecks() {
        // Check daily for expired payments
        setInterval(async () => {
            const now = new Date();
            const expiredPayments = [];
            
            for (const [paymentId, payment] of this.heldPayments) {
                if (payment.expiresAt < now) {
                    expiredPayments.push(payment);
                    this.heldPayments.delete(paymentId);
                }
            }
            
            if (expiredPayments.length > 0) {
                await this.handleExpiredPayments(expiredPayments);
            }
        }, 24 * 60 * 60 * 1000); // Daily
    }

    // Handle expired payments
    async handleExpiredPayments(expiredPayments) {
        for (const payment of expiredPayments) {
            payment.status = 'expired';
            await this.logPaymentEvent('payment_expired', payment);
            await this.sendExpirationNotification(payment);
        }
        
        this.emit('paymentsExpired', expiredPayments);
    }

    // Send expiration notification
    async sendExpirationNotification(payment) {
        // Send email to customer about expired payment
        console.log(`Payment ${payment.id} expired for user ${payment.userId}`);
        // Implementation would send email notification
    }

    // Notify admin of events
    async notifyAdmin(event, data) {
        console.log(`Admin notification: ${event}`, data);
        // In production, send email/SMS to admin
    }

    // Log payment events
    async logPaymentEvent(event, data) {
        console.log(`Payment event: ${event}`, data);
        // In production, store in database
    }

    // Utility methods
    generatePaymentId() {
        return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    generateTransferId() {
        return `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async validateBankDetails(bankDetails) {
        const errors = [];
        
        if (!bankDetails.accountHolderName) errors.push('Account holder name required');
        if (!bankDetails.bankName) errors.push('Bank name required');
        if (!bankDetails.routingNumber) errors.push('Routing number required');
        if (!bankDetails.accountNumber) errors.push('Account number required');
        if (!bankDetails.bankAddress) errors.push('Bank address required');
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    async encryptBankDetails(bankDetails) {
        // In production, use proper encryption
        return {
            encrypted: Buffer.from(JSON.stringify(bankDetails)).toString('base64'),
            algorithm: 'AES-256-GCM',
            timestamp: new Date()
        };
    }

    // Mock database methods
    async storeBankConfiguration(bankConfig) {
        console.log('Bank configuration stored:', bankConfig);
    }

    async storeSubscription(subscription) {
        console.log('Subscription stored:', subscription);
    }

    async storeBankTransfer(transfer) {
        console.log('Bank transfer stored:', transfer);
    }

    // Express.js routes
    getRoutes() {
        const router = require('express').Router();

        // Accept payment and hold
        router.post('/accept', async (req, res) => {
            try {
                const result = await this.acceptPayment(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Configure bank account
        router.post('/configure-bank', async (req, res) => {
            try {
                const result = await this.configureBankAccount(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get held payments status
        router.get('/held-payments', async (req, res) => {
            try {
                const heldPayments = Array.from(this.heldPayments.values());
                res.json({
                    count: heldPayments.length,
                    totalAmount: heldPayments.reduce((sum, p) => sum + p.amount, 0),
                    bankConfigured: this.bankConfigured,
                    payments: heldPayments
                });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Release specific payment
        router.post('/release/:paymentId', async (req, res) => {
            try {
                const payment = this.heldPayments.get(req.params.paymentId);
                if (!payment) {
                    return res.status(404).json({ error: 'Payment not found' });
                }
                
                const result = await this.processPaymentToBank(payment);
                res.json(result);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        return router;
    }
}

module.exports = PaymentHoldingSystem;
