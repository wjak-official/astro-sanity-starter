import type { APIRoute } from 'astro';
import { configManager } from '@admin/utils/config-manager';
import { activityTracker, ActivityTypes } from '@admin/utils/activity-tracker';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { projectId, dataset, token } = body;

        if (!projectId || !dataset || !token) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Missing required parameters',
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Save the configuration
        await configManager.save({
            SANITY_PROJECT_ID: projectId,
            SANITY_DATASET: dataset,
            SANITY_TOKEN: token,
        });

        // Auto-populate studio variables
        await configManager.autoPopulateStudioVars();

        // Export to .env file
        await configManager.exportToEnv();

        // Track activity
        await activityTracker.addActivity(
            ActivityTypes.CONFIG_UPDATED,
            'Sanity configuration saved',
            '⚙️'
        );

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Configuration saved successfully',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                success: false,
                message: error?.message || 'Failed to save configuration',
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
