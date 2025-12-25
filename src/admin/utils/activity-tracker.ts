import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Activity {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    icon: string;
    userId?: string;
}

/**
 * Activity tracking utilities
 */
export class ActivityTracker {
    private activityFilePath: string;
    private maxActivities = 100;

    constructor() {
        this.activityFilePath = path.join(__dirname, '../../../.admin-activity.json');
    }

    /**
     * Load activities from file
     */
    async loadActivities(): Promise<Activity[]> {
        try {
            const data = await fs.readFile(this.activityFilePath, 'utf-8');
            const activities = JSON.parse(data);
            return Array.isArray(activities) ? activities : [];
        } catch (error) {
            return [];
        }
    }

    /**
     * Save activities to file
     */
    private async saveActivities(activities: Activity[]): Promise<void> {
        await fs.writeFile(
            this.activityFilePath,
            JSON.stringify(activities, null, 2),
            'utf-8'
        );
    }

    /**
     * Add a new activity
     */
    async addActivity(
        type: string,
        message: string,
        icon: string = '📌',
        userId?: string
    ): Promise<void> {
        const activities = await this.loadActivities();
        
        const newActivity: Activity = {
            id: Date.now().toString(),
            type,
            message,
            timestamp: new Date().toISOString(),
            icon,
            userId,
        };

        activities.unshift(newActivity);

        // Keep only the most recent activities
        const trimmedActivities = activities.slice(0, this.maxActivities);
        
        await this.saveActivities(trimmedActivities);
    }

    /**
     * Get recent activities
     */
    async getRecentActivities(limit: number = 20): Promise<Activity[]> {
        const activities = await this.loadActivities();
        return activities.slice(0, limit);
    }

    /**
     * Clear all activities
     */
    async clearActivities(): Promise<void> {
        await this.saveActivities([]);
    }

    /**
     * Get activities by type
     */
    async getActivitiesByType(type: string, limit: number = 20): Promise<Activity[]> {
        const activities = await this.loadActivities();
        return activities.filter(a => a.type === type).slice(0, limit);
    }
}

// Export singleton instance
export const activityTracker = new ActivityTracker();

// Activity type constants
export const ActivityTypes = {
    PAGE_CREATED: 'page_created',
    PAGE_UPDATED: 'page_updated',
    PAGE_PUBLISHED: 'page_published',
    PAGE_DELETED: 'page_deleted',
    MEDIA_UPLOADED: 'media_uploaded',
    MEDIA_DELETED: 'media_deleted',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    CONFIG_UPDATED: 'config_updated',
    PROJECT_CREATED: 'project_created',
    DATA_IMPORTED: 'data_imported',
};
