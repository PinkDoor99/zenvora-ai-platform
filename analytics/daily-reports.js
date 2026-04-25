/**
 * Zenvora AI Platform - Daily Analytics & Reporting System
 * Automated daily reports for visits, signups, and revenue
 */

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { EventEmitter } = require('events');

class DailyReports extends EventEmitter {
    constructor() {
        super();
        this.emailTransporter = null;
        this.reportRecipients = [];
        this.reportData = {
            visits: [],
            signups: [],
            revenue: [],
            subscriptions: [],
            usage: []
        };
        
        this.initializeEmailService();
        this.setupScheduledReports();
    }

    initializeEmailService() {
        // Configure email service for sending reports
        this.emailTransporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Set default recipients
        this.reportRecipients = (process.env.REPORT_RECIPIENTS || '').split(',').map(email => email.trim());
    }

    setupScheduledReports() {
        // Schedule daily report at 9:00 AM every day
        cron.schedule('0 9 * * *', async () => {
            console.log('Generating daily analytics report...');
            await this.generateDailyReport();
        });

        // Schedule weekly summary on Sunday at 10:00 AM
        cron.schedule('0 10 * * 0', async () => {
            console.log('Generating weekly analytics summary...');
            await this.generateWeeklyReport();
        });

        // Schedule monthly report on 1st of each month at 10:00 AM
        cron.schedule('0 10 1 * *', async () => {
            console.log('Generating monthly analytics report...');
            await this.generateMonthlyReport();
        });
    }

    // Data Collection Methods
    async trackVisit(userId, sessionId, userAgent, ip, referrer) {
        const visit = {
            timestamp: new Date(),
            userId: userId || 'anonymous',
            sessionId,
            userAgent,
            ip: this.anonymizeIP(ip),
            referrer: referrer || 'direct',
            page: '/dashboard',
            duration: 0
        };

        this.reportData.visits.push(visit);
        await this.saveVisitToDatabase(visit);
        this.emit('visitTracked', visit);
    }

    async trackSignup(userId, email, plan, source) {
        const signup = {
            timestamp: new Date(),
            userId,
            email: this.anonymizeEmail(email),
            plan: plan || 'free',
            source: source || 'organic',
            conversionRate: await this.calculateConversionRate(source)
        };

        this.reportData.signups.push(signup);
        await this.saveSignupToDatabase(signup);
        this.emit('signupTracked', signup);
    }

    async trackRevenue(amount, type, userId, subscriptionId, paymentMethod) {
        const revenue = {
            timestamp: new Date(),
            amount: parseFloat(amount),
            type: type, // 'subscription', 'one_time', 'upgrade'
            userId,
            subscriptionId,
            paymentMethod, // 'stripe', 'paypal', 'bank_transfer'
            currency: 'USD',
            fees: await this.calculatePaymentFees(amount, paymentMethod),
            netAmount: 0
        };

        revenue.netAmount = revenue.amount - revenue.fees;

        this.reportData.revenue.push(revenue);
        await this.saveRevenueToDatabase(revenue);
        this.emit('revenueTracked', revenue);
    }

    async trackSubscriptionEvent(userId, event, subscriptionTier, previousTier = null) {
        const subscription = {
            timestamp: new Date(),
            userId,
            event, // 'created', 'upgraded', 'downgraded', 'cancelled', 'renewed'
            subscriptionTier,
            previousTier,
            monthlyValue: this.getTierMonthlyValue(subscriptionTier),
            ltv: await this.calculateCustomerLifetimeValue(userId)
        };

        this.reportData.subscriptions.push(subscription);
        await this.saveSubscriptionToDatabase(subscription);
        this.emit('subscriptionTracked', subscription);
    }

    async trackUsage(userId, feature, usageAmount, tier) {
        const usage = {
            timestamp: new Date(),
            userId,
            feature,
            usageAmount,
            tier,
            efficiency: await this.calculateUsageEfficiency(userId, feature)
        };

        this.reportData.usage.push(usage);
        await this.saveUsageToDatabase(usage);
        this.emit('usageTracked', usage);
    }

    // Report Generation Methods
    async generateDailyReport() {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const dailyData = await this.getReportData(yesterday, today);
        const report = this.createDailyReportHTML(dailyData, yesterday);

        await this.sendReportEmail('Daily Report', report, yesterday);
        await this.saveReportToDatabase('daily', dailyData, yesterday);
        
        this.emit('dailyReportGenerated', { data: dailyData, date: yesterday });
        return dailyData;
    }

    async generateWeeklyReport() {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const weeklyData = await this.getReportData(weekAgo, today);
        const report = this.createWeeklyReportHTML(weeklyData, weekAgo);

        await this.sendReportEmail('Weekly Report', report, weekAgo);
        await this.saveReportToDatabase('weekly', weeklyData, weekAgo);
        
        this.emit('weeklyReportGenerated', { data: weeklyData, date: weekAgo });
        return weeklyData;
    }

    async generateMonthlyReport() {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const monthlyData = await this.getReportData(monthAgo, today);
        const report = this.createMonthlyReportHTML(monthlyData, monthAgo);

        await this.sendReportEmail('Monthly Report', report, monthAgo);
        await this.saveReportToDatabase('monthly', monthlyData, monthAgo);
        
        this.emit('monthlyReportGenerated', { data: monthlyData, date: monthAgo });
        return monthlyData;
    }

    async getReportData(startDate, endDate) {
        // In production, this would query the database
        const mockData = {
            visits: this.reportData.visits.filter(v => v.timestamp >= startDate && v.timestamp < endDate),
            signups: this.reportData.signups.filter(s => s.timestamp >= startDate && s.timestamp < endDate),
            revenue: this.reportData.revenue.filter(r => r.timestamp >= startDate && r.timestamp < endDate),
            subscriptions: this.reportData.subscriptions.filter(s => s.timestamp >= startDate && s.timestamp < endDate),
            usage: this.reportData.usage.filter(u => u.timestamp >= startDate && u.timestamp < endDate)
        };

        return {
            summary: this.calculateSummaryStats(mockData),
            details: mockData,
            trends: await this.calculateTrends(mockData),
            insights: await this.generateInsights(mockData)
        };
    }

    createDailyReportHTML(data, date) {
        const { summary, details, trends, insights } = data;
        
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #6366f1; }
        .date { color: #666; margin-top: 10px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 14px; opacity: 0.9; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; border-left: 4px solid #6366f1; padding-left: 10px; }
        .trend { display: flex; align-items: center; gap: 10px; margin: 10px 0; }
        .trend-up { color: #10b981; }
        .trend-down { color: #ef4444; }
        .insight { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 10px 0; }
        .revenue-breakdown { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .revenue-item { text-align: center; padding: 15px; background: #f8fafc; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 Zenvora AI Platform</div>
            <div class="date">Daily Report - ${date.toLocaleDateString()}</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${summary.totalVisits}</div>
                <div class="stat-label">Total Visits</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.totalSignups}</div>
                <div class="stat-label">New Signups</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$${summary.totalRevenue.toFixed(2)}</div>
                <div class="stat-label">Total Revenue</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${summary.activeSubscriptions}</div>
                <div class="stat-label">Active Subscriptions</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📈 Performance Trends</div>
            ${trends.map(trend => `
                <div class="trend">
                    <span>${trend.metric}:</span>
                    <span class="${trend.direction === 'up' ? 'trend-up' : 'trend-down'}">
                        ${trend.direction === 'up' ? '↑' : '↓'} ${trend.percentage}%
                    </span>
                    <span>${trend.description}</span>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <div class="section-title">💰 Revenue Breakdown</div>
            <div class="revenue-breakdown">
                ${summary.revenueByTier.map(tier => `
                    <div class="revenue-item">
                        <div style="font-weight: bold;">${tier.tier}</div>
                        <div style="font-size: 20px; color: #6366f1;">$${tier.amount.toFixed(2)}</div>
                        <div style="font-size: 12px; color: #666;">${tier.count} users</div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">💡 Key Insights</div>
            ${insights.map(insight => `
                <div class="insight">
                    <strong>${insight.title}</strong><br>
                    ${insight.description}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <div class="section-title">📊 Top Pages</div>
            ${summary.topPages.map(page => `
                <div style="padding: 10px; border-bottom: 1px solid #eee;">
                    <strong>${page.page}</strong> - ${page.visits} visits (${page.percentage}%)
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }

    createWeeklyReportHTML(data, startDate) {
        // Similar structure but with weekly comparisons and trends
        return this.createDailyReportHTML(data, startDate).replace('Daily Report', 'Weekly Report');
    }

    createMonthlyReportHTML(data, startDate) {
        // Similar structure but with monthly comparisons and annual projections
        return this.createDailyReportHTML(data, startDate).replace('Daily Report', 'Monthly Report');
    }

    // Analytics Calculations
    calculateSummaryStats(data) {
        const summary = {
            totalVisits: data.visits.length,
            uniqueVisitors: new Set(data.visits.map(v => v.userId)).size,
            totalSignups: data.signups.length,
            conversionRate: ((data.signups.length / data.visits.length) * 100).toFixed(2),
            totalRevenue: data.revenue.reduce((sum, r) => sum + r.netAmount, 0),
            grossRevenue: data.revenue.reduce((sum, r) => sum + r.amount, 0),
            totalFees: data.revenue.reduce((sum, r) => sum + r.fees, 0),
            activeSubscriptions: data.subscriptions.filter(s => s.event === 'created' || s.event === 'renewed').length,
            churnRate: this.calculateChurnRate(data.subscriptions),
            averageSessionDuration: this.calculateAverageSessionDuration(data.visits),
            revenueByTier: this.calculateRevenueByTier(data.revenue, data.subscriptions),
            topPages: this.getTopPages(data.visits),
            topReferrers: this.getTopReferrers(data.visits)
        };

        return summary;
    }

    async calculateTrends(data) {
        const trends = [];
        
        // Visit trends
        const visitTrend = await this.calculateVisitTrend(data.visits);
        if (visitTrend) trends.push(visitTrend);
        
        // Revenue trends
        const revenueTrend = await this.calculateRevenueTrend(data.revenue);
        if (revenueTrend) trends.push(revenueTrend);
        
        // Signup trends
        const signupTrend = await this.calculateSignupTrend(data.signups);
        if (signupTrend) trends.push(signupTrend);

        return trends;
    }

    async generateInsights(data) {
        const insights = [];

        // Revenue insights
        if (data.summary.totalRevenue > 1000) {
            insights.push({
                title: '🎯 Revenue Milestone',
                description: `Great job! You've generated $${data.summary.totalRevenue.toFixed(2)} in revenue. Consider scaling marketing efforts.`
            });
        }

        // Conversion insights
        if (data.summary.conversionRate > 5) {
            insights.push({
                title: '🔥 High Conversion Rate',
                description: `Your conversion rate is ${data.summary.conversionRate}%, which is excellent! Focus on retaining these users.`
            });
        }

        // Churn insights
        if (data.summary.churnRate > 10) {
            insights.push({
                title: '⚠️ High Churn Rate',
                description: `Churn rate is ${data.summary.churnRate.toFixed(2)}%. Consider improving onboarding or adding retention features.`
            });
        }

        // Usage insights
        const topFeature = this.getMostUsedFeature(data.usage);
        if (topFeature) {
            insights.push({
                title: '⭐ Popular Feature',
                description: `${topFeature.feature} is the most used feature with ${topFeature.usage} uses. Consider enhancing it.`
            });
        }

        return insights;
    }

    // Helper Methods
    anonymizeIP(ip) {
        // Anonymize IP for privacy compliance
        if (!ip) return 'unknown';
        const parts = ip.split('.');
        return parts.length === 4 ? `${parts[0]}.${parts[1]}.xxx.xxx` : 'unknown';
    }

    anonymizeEmail(email) {
        // Anonymize email for reports
        if (!email) return 'unknown';
        const [username, domain] = email.split('@');
        const maskedUsername = username.substring(0, 2) + '***';
        return `${maskedUsername}@${domain}`;
    }

    async calculateConversionRate(source) {
        // Calculate conversion rate by traffic source
        // In production, this would query database
        return Math.random() * 10; // Mock calculation
    }

    async calculatePaymentFees(amount, paymentMethod) {
        // Calculate payment processing fees
        const feeRates = {
            stripe: 0.029 + 0.30, // 2.9% + $0.30
            paypal: 0.034 + 0.30, // 3.4% + $0.30
            bank_transfer: 0.005 // 0.5% flat rate
        };

        const rate = feeRates[paymentMethod] || feeRates.stripe;
        return (amount * rate) + (paymentMethod !== 'bank_transfer' ? 0.30 : 0);
    }

    getTierMonthlyValue(tier) {
        const tierValues = {
            free: 0,
            starter: 9.99,
            professional: 19.99,
            enterprise: 49.99
        };
        return tierValues[tier] || 0;
    }

    async calculateCustomerLifetimeValue(userId) {
        // Calculate LTV for a customer
        // In production, this would query customer history
        return Math.random() * 500; // Mock calculation
    }

    async calculateUsageEfficiency(userId, feature) {
        // Calculate how efficiently users are using features
        return Math.random() * 100; // Mock calculation
    }

    calculateChurnRate(subscriptions) {
        const cancelled = subscriptions.filter(s => s.event === 'cancelled').length;
        const total = subscriptions.length;
        return total > 0 ? (cancelled / total) * 100 : 0;
    }

    calculateAverageSessionDuration(visits) {
        const validVisits = visits.filter(v => v.duration > 0);
        if (validVisits.length === 0) return 0;
        
        const totalDuration = validVisits.reduce((sum, v) => sum + v.duration, 0);
        return Math.round(totalDuration / validVisits.length / 60); // Convert to minutes
    }

    calculateRevenueByTier(revenue, subscriptions) {
        const revenueByTier = {};
        
        // Group revenue by subscription tier
        subscriptions.forEach(sub => {
            if (sub.event === 'created' || sub.event === 'renewed') {
                if (!revenueByTier[sub.subscriptionTier]) {
                    revenueByTier[sub.subscriptionTier] = { amount: 0, count: 0 };
                }
                revenueByTier[sub.subscriptionTier].amount += sub.monthlyValue;
                revenueByTier[sub.subscriptionTier].count += 1;
            }
        });

        // Convert to array format
        return Object.entries(revenueByTier).map(([tier, data]) => ({
            tier: tier.charAt(0).toUpperCase() + tier.slice(1),
            amount: data.amount,
            count: data.count
        }));
    }

    getTopPages(visits) {
        const pageCounts = {};
        visits.forEach(visit => {
            pageCounts[visit.page] = (pageCounts[visit.page] || 0) + 1;
        });

        const total = visits.length;
        return Object.entries(pageCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([page, count]) => ({
                page,
                visits: count,
                percentage: ((count / total) * 100).toFixed(1)
            }));
    }

    getTopReferrers(visits) {
        const referrerCounts = {};
        visits.forEach(visit => {
            referrerCounts[visit.referrer] = (referrerCounts[visit.referrer] || 0) + 1;
        });

        return Object.entries(referrerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([referrer, count]) => ({ referrer, count }));
    }

    getMostUsedFeature(usage) {
        const featureCounts = {};
        usage.forEach(u => {
            featureCounts[u.feature] = (featureCounts[u.feature] || 0) + u.usageAmount;
        });

        let maxFeature = null;
        let maxUsage = 0;

        Object.entries(featureCounts).forEach(([feature, usage]) => {
            if (usage > maxUsage) {
                maxUsage = usage;
                maxFeature = { feature, usage };
            }
        });

        return maxFeature;
    }

    async calculateVisitTrend(visits) {
        // Calculate visit trend compared to previous period
        // In production, this would compare with historical data
        const direction = Math.random() > 0.5 ? 'up' : 'down';
        const percentage = (Math.random() * 20).toFixed(1);
        
        return {
            metric: 'Visits',
            direction,
            percentage,
            description: direction === 'up' ? 'More users visiting the platform' : 'Decrease in user visits'
        };
    }

    async calculateRevenueTrend(revenue) {
        // Calculate revenue trend
        const totalRevenue = revenue.reduce((sum, r) => sum + r.netAmount, 0);
        const direction = totalRevenue > 100 ? 'up' : 'down';
        const percentage = (Math.random() * 15).toFixed(1);
        
        return {
            metric: 'Revenue',
            direction,
            percentage,
            description: direction === 'up' ? 'Revenue is growing' : 'Revenue needs attention'
        };
    }

    async calculateSignupTrend(signups) {
        // Calculate signup trend
        const direction = signups.length > 5 ? 'up' : 'down';
        const percentage = (Math.random() * 25).toFixed(1);
        
        return {
            metric: 'Signups',
            direction,
            percentage,
            description: direction === 'up' ? 'User acquisition is strong' : 'User acquisition needs improvement'
        };
    }

    // Email Methods
    async sendReportEmail(subject, htmlContent, date) {
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: this.reportRecipients.join(', '),
                subject: `Zenvora AI Platform - ${subject} - ${date.toLocaleDateString()}`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `report-${date.toISOString().split('T')[0]}.json`,
                        content: JSON.stringify({ date: date, data: htmlContent }, null, 2),
                        contentType: 'application/json'
                    }
                ]
            };

            const result = await this.emailTransporter.sendMail(mailOptions);
            console.log('Report email sent:', result.messageId);
            
            this.emit('reportSent', { subject, date, messageId: result.messageId });
            return result;
        } catch (error) {
            console.error('Failed to send report email:', error);
            this.emit('reportError', { subject, date, error });
            throw error;
        }
    }

    // Database Methods (Mock implementations)
    async saveVisitToDatabase(visit) {
        // In production, save to database
        console.log('Saving visit to database:', visit);
    }

    async saveSignupToDatabase(signup) {
        // In production, save to database
        console.log('Saving signup to database:', signup);
    }

    async saveRevenueToDatabase(revenue) {
        // In production, save to database
        console.log('Saving revenue to database:', revenue);
    }

    async saveSubscriptionToDatabase(subscription) {
        // In production, save to database
        console.log('Saving subscription to database:', subscription);
    }

    async saveUsageToDatabase(usage) {
        // In production, save to database
        console.log('Saving usage to database:', usage);
    }

    async saveReportToDatabase(type, data, date) {
        // In production, save report to database
        console.log(`Saving ${type} report to database:`, { date, summary: data.summary });
    }

    // Express.js Routes
    getRoutes() {
        const router = require('express').Router();

        // Track analytics events
        router.post('/track/visit', async (req, res) => {
            try {
                const { userId, sessionId, userAgent, ip, referrer } = req.body;
                await this.trackVisit(userId, sessionId, userAgent, ip, referrer);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.post('/track/signup', async (req, res) => {
            try {
                const { userId, email, plan, source } = req.body;
                await this.trackSignup(userId, email, plan, source);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.post('/track/revenue', async (req, res) => {
            try {
                const { amount, type, userId, subscriptionId, paymentMethod } = req.body;
                await this.trackRevenue(amount, type, userId, subscriptionId, paymentMethod);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.post('/track/subscription', async (req, res) => {
            try {
                const { userId, event, subscriptionTier, previousTier } = req.body;
                await this.trackSubscriptionEvent(userId, event, subscriptionTier, previousTier);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.post('/track/usage', async (req, res) => {
            try {
                const { userId, feature, usageAmount, tier } = req.body;
                await this.trackUsage(userId, feature, usageAmount, tier);
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Generate reports on demand
        router.get('/report/daily', async (req, res) => {
            try {
                const data = await this.generateDailyReport();
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.get('/report/weekly', async (req, res) => {
            try {
                const data = await this.generateWeeklyReport();
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.get('/report/monthly', async (req, res) => {
            try {
                const data = await this.generateMonthlyReport();
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Get analytics dashboard data
        router.get('/dashboard', async (req, res) => {
            try {
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                const data = await this.getReportData(thirtyDaysAgo, today);
                res.json(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Configure report recipients
        router.post('/configure', async (req, res) => {
            try {
                const { recipients, schedule } = req.body;
                this.reportRecipients = recipients;
                // Update configuration in database
                res.json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        return router;
    }
}

module.exports = DailyReports;
