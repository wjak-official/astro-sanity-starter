import type { APIRoute } from 'astro';
import { createSanityProject } from '@admin/utils/sanity-api';
import { validateProjectInput } from '@admin/utils/validation';
import { activityTracker, ActivityTypes } from '@admin/utils/activity-tracker';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        
        // Validate input
        const input = validateProjectInput(body);

        // Create the project
        const result = await createSanityProject({
            token: body.token,
            projectName: input.projectName,
            dataset: input.dataset,
            organizationId: input.organizationId,
        });

        if (result.success) {
            // Track activity
            await activityTracker.addActivity(
                ActivityTypes.PROJECT_CREATED,
                `Sanity project "${input.projectName}" created`,
                '🎉'
            );
        }

        return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                success: false,
                message: error?.message || 'Failed to create project',
            }),
            {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
