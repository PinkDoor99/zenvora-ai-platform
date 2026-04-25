/**
 * Zenvora AI Platform - Enterprise Analytics
 * Advanced analytics, reporting, and business intelligence
 */

const { EventEmitter } = require('events');
const cron = require('node-cron');
const fs = require('fs').promises;
const path = require('path');

class EnterpriseAnalytics extends EventEmitter {
    constructor(config) {
        super();
        this.config = {
            database: config.database,
            redis: config.redis,
            retention: config.retention || { days: 365 },
            aggregation: config.aggregation || { enabled: true, interval: '5m' },
            realTime: config.realTime || { enabled: true, batchSize: 1000 },
            export: config.export || { enabled: true, formats: ['csv', 'json', 'pdf'] }
        };
        
        this.metrics = new Map();
        this.realTimeBuffer = [];
        this.aggregatedData = new Map();
        this.reports = new Map();
        
        this.initializeAggregation();
        this.initializeRealTimeProcessing();
    }

    // Core Analytics Methods
    async trackEvent(userId, event, data = {}) {
        const timestamp = new Date();
        const eventRecord = {
            id: this.generateId(),
            userId,
            event,
            data,
            timestamp,
            sessionId: data.sessionId,
            userAgent: data.userAgent,
            ip: data.ip,
            platform: data.platform,
            version: data.version
        };

        // Store in database
        await this.storeEvent(eventRecord);
        
        // Real-time processing
        if (this.config.realTime.enabled) {
            this.processRealTimeEvent(eventRecord);
        }

        // Emit event for real-time dashboards
        this.emit('event', eventRecord);
        
        return eventRecord;
    }

    async trackMetrics(userId, metrics) {
        const timestamp = new Date();
        const metricsRecord = {
            id: this.generateId(),
            userId,
            metrics,
            timestamp,
            type: 'metrics'
        };

        await this.storeMetrics(metricsRecord);
        this.emit('metrics', metricsRecord);
        
        return metricsRecord;
    }

    async trackPerformance(userId, performanceData) {
        const record = {
            id: this.generateId(),
            userId,
            ...performanceData,
            timestamp: new Date(),
            type: 'performance'
        };

        await this.storePerformance(record);
        this.emit('performance', record);
        
        return record;
    }

    // Real-time Processing
    processRealTimeEvent(event) {
        this.realTimeBuffer.push(event);
        
        if (this.realTimeBuffer.length >= this.config.realTime.batchSize) {
            this.flushRealTimeBuffer();
        }
    }

    flushRealTimeBuffer() {
        if (this.realTimeBuffer.length === 0) return;
        
        const batch = this.realTimeBuffer.splice(0, this.config.realTime.batchSize);
        this.processBatch(batch);
    }

    processBatch(events) {
        // Aggregate events in real-time
        const aggregated = {};
        
        for (const event of events) {
            const key = `${event.event}:${event.userId}`;
            if (!aggregated[key]) {
                aggregated[key] = {
                    event: event.event,
                    userId: event.userId,
                    count: 0,
                    firstSeen: event.timestamp,
                    lastSeen: event.timestamp,
                    data: {}
                };
            }
            
            aggregated[key].count++;
            aggregated[key].lastSeen = event.timestamp;
            
            // Aggregate specific data
            if (event.data.duration) {
                aggregated[key].data.avgDuration = 
                    (aggregated[key].data.avgDuration || 0) + event.data.duration;
            }
        }

        // Update real-time metrics
        for (const [key, data] of Object.entries(aggregated)) {
            this.updateRealTimeMetrics(key, data);
        }
    }

    updateRealTimeMetrics(key, data) {
        if (!this.aggregatedData.has(key)) {
            this.aggregatedData.set(key, {
                ...data,
                data: { ...data.data }
            });
        } else {
            const existing = this.aggregatedData.get(key);
            existing.count += data.count;
            existing.lastSeen = data.lastSeen;
            
            // Update averages
            if (data.data.avgDuration) {
                existing.data.avgDuration = 
                    (existing.data.avgDuration || 0) + data.data.avgDuration;
            }
        }
    }

    // Aggregation Jobs
    initializeAggregation() {
        if (!this.config.aggregation.enabled) return;

        // Every 5 minutes - aggregate recent events
        cron.schedule('*/5 * * * *', () => {
            this.aggregateRecentEvents();
        });

        // Every hour - aggregate hourly metrics
        cron.schedule('0 * * * *', () => {
            this.aggregateHourlyMetrics();
        });

        // Every day - aggregate daily metrics
        cron.schedule('0 0 * * *', () => {
            this.aggregateDailyMetrics();
        });

        // Every week - cleanup old data
        cron.schedule('0 0 * * 0', () => {
            this.cleanupOldData();
        });
    }

    async aggregateRecentEvents() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        const events = await this.getEventsSince(fiveMinutesAgo);
        const aggregated = this.aggregateEvents(events, '5m');
        
        await this.storeAggregatedData('5m', aggregated);
        this.emit('aggregated', { period: '5m', data: aggregated });
    }

    async aggregateHourlyMetrics() {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        const events = await this.getEventsSince(oneHourAgo);
        const aggregated = this.aggregateEvents(events, '1h');
        
        await this.storeAggregatedData('1h', aggregated);
        this.emit('aggregated', { period: '1h', data: aggregated });
    }

    async aggregateDailyMetrics() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const events = await this.getEventsSince(oneDayAgo);
        const aggregated = this.aggregateEvents(events, '1d');
        
        await this.storeAggregatedData('1d', aggregated);
        this.emit('aggregated', { period: '1d', data: aggregated });
    }

    aggregateEvents(events, period) {
        const aggregated = {
            period,
            timestamp: new Date(),
            totalEvents: events.length,
            uniqueUsers: new Set(events.map(e => e.userId)).size,
            events: {},
            metrics: {},
            performance: {}
        };

        // Aggregate by event type
        for (const event of events) {
            if (!aggregated.events[event.event]) {
                aggregated.events[event.event] = {
                    count: 0,
                    uniqueUsers: new Set(),
                    avgDuration: 0,
                    totalDuration: 0
                };
            }
            
            const eventAgg = aggregated.events[event.event];
            eventAgg.count++;
            eventAgg.uniqueUsers.add(event.userId);
            
            if (event.data.duration) {
                eventAgg.totalDuration += event.data.duration;
            }
        }

        // Calculate averages
        for (const [eventName, data] of Object.entries(aggregated.events)) {
            data.uniqueUsers = data.uniqueUsers.size;
            if (data.totalDuration > 0 && data.count > 0) {
                data.avgDuration = data.totalDuration / data.count;
            }
            delete data.totalDuration;
        }

        return aggregated;
    }

    // User Analytics
    async getUserAnalytics(userId, timeRange = '7d') {
        const startDate = this.getDateRange(timeRange);
        const events = await this.getUserEvents(userId, startDate);
        const metrics = await this.getUserMetrics(userId, startDate);
        const performance = await this.getUserPerformance(userId, startDate);

        return {
            userId,
            timeRange,
            summary: {
                totalEvents: events.length,
                sessionCount: this.calculateSessionCount(events),
                avgSessionDuration: this.calculateAvgSessionDuration(events),
                mostUsedFeatures: this.getMostUsedFeatures(events),
                activityPattern: this.getActivityPattern(events)
            },
            events: this.categorizeEvents(events),
            metrics: this.summarizeMetrics(metrics),
            performance: this.summarizePerformance(performance),
            progress: this.calculateUserProgress(userId, events)
        };
    }

    async getUserProgress(userId, events) {
        const progress = {
            lessonsCompleted: 0,
            codeAnalysisRun: 0,
            projectsCreated: 0,
            aiToolsUsed: 0,
            skillLevel: 'beginner',
            streakDays: 0,
            totalActiveTime: 0
        };

        for (const event of events) {
            switch (event.event) {
                case 'lesson_completed':
                    progress.lessonsCompleted++;
                    break;
                case 'analysis_completed':
                    progress.codeAnalysisRun++;
                    break;
                case 'project_created':
                    progress.projectsCreated++;
                    break;
                case 'ai_tool_used':
                    progress.aiToolsUsed++;
                    break;
                case 'session_active':
                    progress.totalActiveTime += event.data.duration || 0;
                    break;
            }
        }

        // Calculate skill level based on activity
        const totalScore = progress.lessonsCompleted * 10 + 
                           progress.codeAnalysisRun * 5 + 
                           progress.projectsCreated * 15 +
                           progress.aiToolsUsed * 3;

        if (totalScore >= 100) progress.skillLevel = 'expert';
        else if (totalScore >= 50) progress.skillLevel = 'advanced';
        else if (totalScore >= 20) progress.skillLevel = 'intermediate';

        // Calculate streak
        progress.streakDays = this.calculateStreak(events);

        return progress;
    }

    // Business Analytics
    async getBusinessAnalytics(timeRange = '30d') {
        const startDate = this.getDateRange(timeRange);
        
        const [
            userMetrics,
            revenueMetrics,
            engagementMetrics,
            performanceMetrics,
            featureMetrics
        ] = await Promise.all([
            this.getUserMetrics(startDate),
            this.getRevenueMetrics(startDate),
            this.getEngagementMetrics(startDate),
            this.getPerformanceMetrics(startDate),
            this.getFeatureMetrics(startDate)
        ]);

        return {
            timeRange,
            users: userMetrics,
            revenue: revenueMetrics,
            engagement: engagementMetrics,
            performance: performanceMetrics,
            features: featureMetrics,
            trends: await this.calculateTrends(startDate),
            forecasts: await this.generateForecasts()
        };
    }

    async getRevenueMetrics(startDate) {
        // Mock implementation - would query actual billing data
        return {
            totalRevenue: 125000,
            mrr: 10500,
            arr: 126000,
            churnRate: 0.03,
            ltv: 4200,
            newSubscriptions: 45,
            cancellations: 12,
            upgrades: 23,
            downgrades: 5
        };
    }

    async getEngagementMetrics(startDate) {
        const events = await this.getEventsSince(startDate);
        
        return {
            dailyActiveUsers: this.calculateDAU(events),
            monthlyActiveUsers: this.calculateMAU(events),
            sessionDuration: this.calculateAvgSessionDuration(events),
            retentionRate: this.calculateRetentionRate(events),
            bounceRate: this.calculateBounceRate(events),
            featureAdoption: this.calculateFeatureAdoption(events),
            userSatisfaction: await this.calculateSatisfaction()
        };
    }

    // Reporting
    async generateReport(reportType, filters = {}) {
        const report = {
            id: this.generateId(),
            type: reportType,
            generatedAt: new Date(),
            filters,
            data: await this.getReportData(reportType, filters),
            charts: await this.generateCharts(reportType, filters),
            insights: await this.generateInsights(reportType, filters)
        };

        this.reports.set(report.id, report);
        await this.saveReport(report);
        
        return report;
    }

    async getReportData(reportType, filters) {
        switch (reportType) {
            case 'user_activity':
                return await this.getUserActivityReport(filters);
            case 'revenue':
                return await this.getRevenueReport(filters);
            case 'performance':
                return await this.getPerformanceReport(filters);
            case 'engagement':
                return await this.getEngagementReport(filters);
            case 'feature_usage':
                return await this.getFeatureUsageReport(filters);
            default:
                throw new Error(`Unknown report type: ${reportType}`);
        }
    }

    async generateCharts(reportType, filters) {
        const data = await this.getReportData(reportType, filters);
        
        return {
            lineChart: this.generateLineChart(data),
            barChart: this.generateBarChart(data),
            pieChart: this.generatePieChart(data),
            heatmap: this.generateHeatmap(data)
        };
    }

    async generateInsights(reportType, filters) {
        const data = await this.getReportData(reportType, filters);
        const insights = [];

        // Generate AI-powered insights
        if (reportType === 'user_activity') {
            if (data.dau < data.mau * 0.1) {
                insights.push({
                    type: 'warning',
                    message: 'Daily active users are below 10% of monthly active users',
                    recommendation: 'Consider improving user engagement strategies'
                });
            }

            if (data.retentionRate < 0.7) {
                insights.push({
                    type: 'critical',
                    message: 'User retention rate is below 70%',
                    recommendation: 'Implement user onboarding and engagement programs'
                });
            }
        }

        return insights;
    }

    // Export Functions
    async exportData(reportId, format = 'json') {
        const report = this.reports.get(reportId);
        if (!report) {
            throw new Error('Report not found');
        }

        switch (format) {
            case 'json':
                return this.exportToJSON(report);
            case 'csv':
                return this.exportToCSV(report);
            case 'pdf':
                return this.exportToPDF(report);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }

    exportToJSON(report) {
        return JSON.stringify(report, null, 2);
    }

    exportToCSV(report) {
        // Convert report data to CSV format
        const csv = this.convertToCSV(report.data);
        return csv;
    }

    exportToPDF(report) {
        // Generate PDF report
        return this.generatePDFReport(report);
    }

    // Real-time Dashboard
    getRealTimeMetrics() {
        return {
            activeUsers: this.getActiveUserCount(),
            currentLoad: this.getCurrentSystemLoad(),
            recentEvents: this.getRecentEvents(),
            alerts: this.getActiveAlerts(),
            performance: this.getCurrentPerformance()
        };
    }

    // Helper Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getDateRange(range) {
        const now = new Date();
        let startDate;

        switch (range) {
            case '1d':
                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                break;
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        }

        return startDate;
    }

    // Database Methods (mock implementations)
    async storeEvent(event) {
        // Store event in database
        console.log('Storing event:', event.id);
    }

    async storeMetrics(metrics) {
        // Store metrics in database
        console.log('Storing metrics:', metrics.id);
    }

    async storePerformance(performance) {
        // Store performance data in database
        console.log('Storing performance:', performance.id);
    }

    async getEventsSince(startDate) {
        // Get events from database since startDate
        return [];
    }

    async getUserEvents(userId, startDate) {
        // Get user events from database
        return [];
    }

    async getUserMetrics(userId, startDate) {
        // Get user metrics from database
        return [];
    }

    async getUserPerformance(userId, startDate) {
        // Get user performance from database
        return [];
    }

    async storeAggregatedData(period, data) {
        // Store aggregated data
        console.log(`Storing ${period} aggregated data`);
    }

    async saveReport(report) {
        // Save report to database
        console.log('Saving report:', report.id);
    }

    // Cleanup
    async cleanupOldData() {
        const cutoffDate = new Date(Date.now() - this.config.retention.days * 24 * 60 * 60 * 1000);
        
        // Clean up old events
        await this.deleteEventsBefore(cutoffDate);
        
        // Clean up old metrics
        await this.deleteMetricsBefore(cutoffDate);
        
        // Clean up old reports
        await this.deleteReportsBefore(cutoffDate);
        
        this.emit('cleanup', { cutoffDate });
    }

    // Express.js Routes
    getRoutes() {
        const router = require('express').Router();

        // Event tracking
        router.post('/events', async (req, res) => {
            try {
                const { userId, event, data } = req.body;
                const result = await this.trackEvent(userId, event, data);
                res.json({ success: true, event: result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Metrics tracking
        router.post('/metrics', async (req, res) => {
            try {
                const { userId, metrics } = req.body;
                const result = await this.trackMetrics(userId, metrics);
                res.json({ success: true, metrics: result });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // User analytics
        router.get('/users/:userId/analytics', async (req, res) => {
            try {
                const { userId } = req.params;
                const { timeRange = '7d' } = req.query;
                const analytics = await this.getUserAnalytics(userId, timeRange);
                res.json(analytics);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Business analytics
        router.get('/business/analytics', async (req, res) => {
            try {
                const { timeRange = '30d' } = req.query;
                const analytics = await this.getBusinessAnalytics(timeRange);
                res.json(analytics);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Reports
        router.post('/reports', async (req, res) => {
            try {
                const { type, filters } = req.body;
                const report = await this.generateReport(type, filters);
                res.json(report);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.get('/reports/:id', async (req, res) => {
            try {
                const { id } = req.params;
                const report = this.reports.get(id);
                if (!report) {
                    return res.status(404).json({ error: 'Report not found' });
                }
                res.json(report);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        router.get('/reports/:id/export', async (req, res) => {
            try {
                const { id } = req.params;
                const { format = 'json' } = req.query;
                const data = await this.exportData(id, format);
                
                res.setHeader('Content-Type', this.getContentType(format));
                res.setHeader('Content-Disposition', `attachment; filename="report.${format}"`);
                res.send(data);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Real-time metrics
        router.get('/realtime', (req, res) => {
            try {
                const metrics = this.getRealTimeMetrics();
                res.json(metrics);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        return router;
    }

    getContentType(format) {
        const types = {
            json: 'application/json',
            csv: 'text/csv',
            pdf: 'application/pdf'
        };
        return types[format] || 'application/json';
    }
}

module.exports = EnterpriseAnalytics;
