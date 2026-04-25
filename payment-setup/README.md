# Zenvora AI Platform - Payment Setup Guide

Complete guide to connect Stripe, PayPal, and bank transfers to receive payments from your platform.

## 🚀 Quick Setup Overview

1. **Stripe Setup** - 5 minutes
2. **PayPal Setup** - 10 minutes  
3. **Bank Transfer Setup** - 15 minutes
4. **Environment Configuration** - 5 minutes
5. **Testing & Verification** - 10 minutes

Total setup time: ~45 minutes

---

## 💳 Stripe Payment Setup

### 1. Create Stripe Account
1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your business email
3. Complete business verification:
   - Business name: "Zenvora AI Platform"
   - Business type: Company/Sole Proprietorship
   - EIN/Tax ID (for business accounts)
   - Bank account information
   - Business website: `https://your-domain.com`

### 2. Get API Keys
1. In Stripe Dashboard, go to **Developers → API keys**
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)
4. For production, create live keys (starts with `pk_live_` and `sk_live_`)

### 3. Configure Products & Prices
1. Go to **Products → Add product**
2. Create subscription products:

**Starter Plan**
```
Name: Zenvora Starter
Description: Basic AI tools and coding features
Price: $9.99/month
Recurring: Monthly
```

**Professional Plan**
```
Name: Zenvora Professional  
Description: Advanced AI tools and unlimited features
Price: $19.99/month
Recurring: Monthly
```

**Enterprise Plan**
```
Name: Zenvora Enterprise
Description: Full platform with enterprise features
Price: $49.99/month
Recurring: Monthly
```

### 4. Set Up Webhooks
1. Go to **Developers → Webhooks → Add endpoint**
2. Endpoint URL: `https://your-domain.com/api/subscription/stripe/webhook`
3. Select events to send:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
4. Copy the webhook signing secret

### 5. Environment Variables
Add to your `.env` file:
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

---

## 🅿️ PayPal Payment Setup

### 1. Create PayPal Business Account
1. Go to [https://www.paypal.com/business](https://www.paypal.com/business)
2. Sign up with your business email
3. Complete business verification:
   - Business name: "Zenvora AI Platform"
   - Business type and registration
   - Bank account linking
   - Email verification

### 2. Create PayPal App
1. Go to **Developer Dashboard → My Apps & Credentials**
2. Click **Create App**
3. App details:
   - App name: "Zenvora AI Platform"
   - Seller: Your business account
   - Feature: Accept payments

### 3. Get API Credentials
1. In your app settings, find:
   - **Client ID** (Public)
   - **Client Secret** (Private)
2. For sandbox testing, use sandbox credentials
3. For production, use live credentials

### 4. Create Subscription Plans
1. Go to **Tools → Recurring Billing → Create Plan**
2. Create plans:

**Starter Plan**
```
Name: Zenvora Starter Monthly
Description: Basic AI tools and coding features
Amount: $9.99
Billing Cycle: Monthly
Trial Period: None
```

**Professional Plan**
```
Name: Zenvora Professional Monthly
Description: Advanced AI tools and unlimited features
Amount: $19.99
Billing Cycle: Monthly
Trial Period: None
```

**Enterprise Plan**
```
Name: Zenvora Enterprise Monthly
Description: Full platform with enterprise features
Amount: $49.99
Billing Cycle: Monthly
Trial Period: None
```

### 5. Set Up Webhooks
1. In Developer Dashboard, go to **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/subscription/paypal/webhook`
3. Select event types:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `PAYMENT.SALE.COMPLETED`
   - `BILLING.SUBSCRIPTION.CANCELLED`

### 6. Environment Variables
Add to your `.env` file:
```env
PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox  # Change to 'live' for production
```

---

## 🏦 Bank Transfer Setup (Alternative)

### 1. Bank Information Collection
For manual bank transfers, collect customer bank details securely:

**Required Information:**
- Account holder name
- Bank name
- Routing number (ABA)
- Account number
- Bank address
- SWIFT/BIC code (for international)

### 2. Secure Collection Form
```html
<!-- Example bank transfer form -->
<form id="bank-transfer-form">
  <div class="form-group">
    <label>Account Holder Name</label>
    <input type="text" name="accountHolder" required>
  </div>
  <div class="form-group">
    <label>Bank Name</label>
    <input type="text" name="bankName" required>
  </div>
  <div class="form-group">
    <label>Routing Number</label>
    <input type="text" name="routingNumber" required>
  </div>
  <div class="form-group">
    <label>Account Number</label>
    <input type="text" name="accountNumber" required>
  </div>
  <button type="submit">Submit Bank Transfer</button>
</form>
```

### 3. Manual Verification Process
1. Receive bank transfer notifications
2. Manually verify payments in admin dashboard
3. Update subscription status in database
4. Send confirmation email to customer

---

## ⚙️ Environment Configuration

### Complete .env File Setup
```env
# Payment Provider Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

PAYPAL_CLIENT_ID=your_paypal_client_id_here
PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
PAYPAL_MODE=sandbox

# Bank Transfer Configuration
BANK_TRANSFER_ENABLED=true
BANK_ACCOUNT_NAME=Zenvora AI Platform
BANK_ROUTING_NUMBER=123456789
BANK_ACCOUNT_NUMBER=987654321
BANK_NAME=Your Bank Name
BANK_ADDRESS=Your Bank Address

# Email Configuration for Reports
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
REPORT_RECIPIENTS=admin@your-domain.com,finance@your-domain.com

# Application Configuration
NODE_ENV=development
DOMAIN=http://localhost:3000  # Change to your production domain
```

---

## 🧪 Testing Setup

### 1. Stripe Testing
1. Use test mode for development
2. Test with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Insufficient funds: `4000 0000 0000 9995`

### 2. PayPal Testing
1. Use PayPal sandbox for development
2. Create sandbox buyer accounts
3. Test subscription creation and cancellation

### 3. End-to-End Testing
```bash
# Test subscription creation
curl -X POST http://localhost:3001/api/subscription/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "tierId": "professional",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancelled"
  }'
```

---

## 📊 Revenue Dashboard Setup

### 1. Admin Dashboard Access
1. Go to `/admin/dashboard` in your platform
2. View real-time analytics:
   - Daily revenue
   - Active subscriptions
   - Conversion rates
   - Churn analysis

### 2. Daily Email Reports
Reports are automatically sent at 9:00 AM daily with:
- Total visits and unique visitors
- New signups and conversion rates
- Revenue breakdown by tier
- Subscription events (new, cancelled, upgraded)
- Usage statistics and trends

### 3. Custom Report Configuration
```javascript
// Configure custom report recipients
fetch('/api/analytics/configure', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    recipients: [
      'ceo@your-domain.com',
      'finance@your-domain.com',
      'marketing@your-domain.com'
    ],
    schedule: {
      daily: true,
      weekly: true,
      monthly: true
    }
  })
});
```

---

## 🚨 Security & Compliance

### 1. PCI Compliance
- Never store raw credit card numbers
- Use Stripe Elements for card collection
- Implement 3D Secure authentication
- Regular security audits

### 2. Data Protection
- Encrypt all sensitive data
- Use HTTPS everywhere
- Implement GDPR compliance
- Regular data backups

### 3. Fraud Prevention
- Monitor suspicious transactions
- Implement velocity checks
- Use Stripe Radar
- Set up alerts for unusual activity

---

## 💰 Payout Information

### 1. Stripe Payouts
- **Schedule**: Daily (2-day rolling)
- **Method**: Bank transfer
- **Minimum**: No minimum
- **Fees**: 2.9% + $0.30 per transaction
- **Dashboard**: stripe.com/dashboard/balance

### 2. PayPal Payouts
- **Schedule**: Daily
- **Method**: Bank transfer or PayPal balance
- **Minimum**: $1.00
- **Fees**: 3.4% + $0.30 per transaction
- **Dashboard**: paypal.com/activity

### 3. Bank Transfer Payouts
- **Schedule**: Manual verification
- **Method**: Direct bank deposit
- **Fees**: Bank transfer fees only
- **Processing**: 1-3 business days

---

## 📞 Support Contacts

### Stripe Support
- **Documentation**: stripe.com/docs
- **Support**: support.stripe.com
- **Phone**: 1-855-642-0355
- **Email**: support@stripe.com

### PayPal Support
- **Documentation**: developer.paypal.com/docs
- **Support**: paypal.com/contact
- **Phone**: 1-888-221-1161
- **Email**: support@paypal.com

### Technical Support
- **Platform Issues**: Check your server logs
- **Integration Help**: Review webhook logs
- **Payment Issues**: Check payment provider dashboards

---

## 🚀 Going Live

### 1. Pre-Launch Checklist
- [ ] All test transactions successful
- [ ] Webhooks receiving events correctly
- [ ] Email reports working
- [ ] SSL certificate installed
- [ ] Terms of service and privacy policy published
- [ ] Contact information available

### 2. Production Switch
1. Update environment variables:
   ```env
   NODE_ENV=production
   STRIPE_PUBLISHABLE_KEY=pk_live_your_key
   STRIPE_SECRET_KEY=sk_live_your_key
   PAYPAL_MODE=live
   ```
2. Test production endpoints
3. Monitor first live transactions
4. Set up alerts for payment failures

### 3. Post-Launch Monitoring
- Monitor transaction success rates
- Watch for payment failures
- Track revenue metrics
- Respond to customer support requests
- Regular reconciliation with bank statements

---

## 💡 Pro Tips

### 1. Revenue Optimization
- Offer annual plans with 20% discount
- Implement free trials for professional tier
- Add enterprise custom pricing
- Use A/B testing for pricing

### 2. Customer Retention
- Send usage reports to customers
- Offer upgrade prompts at usage limits
- Implement dunning emails for failed payments
- Provide cancellation retention offers

### 3. Analytics Insights
- Track conversion by traffic source
- Monitor feature usage by tier
- Analyze churn by subscription length
- Identify high-value customer segments

---

## 📈 Expected Revenue Timeline

### Month 1-3: Launch Phase
- Target: 100-500 users
- Expected MRR: $1,000-$5,000
- Focus: User acquisition and onboarding

### Month 4-6: Growth Phase  
- Target: 500-2,000 users
- Expected MRR: $5,000-$20,000
- Focus: Product optimization and retention

### Month 7-12: Scale Phase
- Target: 2,000-10,000 users
- Expected MRR: $20,000-$100,000
- Focus: Enterprise sales and expansion

---

## 🔧 Troubleshooting

### Common Issues
1. **Webhook not receiving events**
   - Check webhook URL is accessible
   - Verify webhook secret matches
   - Check server logs for errors

2. **Payment failures**
   - Verify API keys are correct
   - Check card details are valid
   - Ensure 3D Secure is working

3. **Subscription not activating**
   - Check webhook processing
   - Verify database updates
   - Confirm customer email delivery

### Debug Mode
Enable debug logging:
```env
DEBUG=stripe, paypal, analytics
LOG_LEVEL=debug
```

---

## 📞 Emergency Contacts

For urgent payment issues:
- **24/7 Emergency**: emergency@your-domain.com
- **Technical Lead**: tech-lead@your-domain.com
- **Finance Team**: finance@your-domain.com

Your Zenvora AI Platform is now ready to accept payments and generate daily reports! 🚀
