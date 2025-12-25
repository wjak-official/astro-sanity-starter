import type { APIRoute } from 'astro';
import { activityTracker } from '@admin/utils/activity-tracker';

export const GET: APIRoute = async () => {
    try {
        const activities = await activityTracker.getRecentActivities(20);

        return new Response(JSON.stringify({ activities }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error fetching activities:', error);
        
        // Return empty array on error
        return new Response(JSON.stringify({ activities: [] }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};
