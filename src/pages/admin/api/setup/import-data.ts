import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { activityTracker, ActivityTypes } from '@admin/utils/activity-tracker';

const execAsync = promisify(exec);

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        const { projectId } = body;

        if (!projectId) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Project ID is required',
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Path to the import script
        const importScript = path.join(process.cwd(), 'sanity-export', 'import.js');

        // Run the import command
        try {
            const { stdout, stderr } = await execAsync(`node "${importScript}" ${projectId}`);
            
            // Track activity
            await activityTracker.addActivity(
                ActivityTypes.DATA_IMPORTED,
                `Sample data imported to project ${projectId}`,
                '📦'
            );

            return new Response(
                JSON.stringify({
                    success: true,
                    message: 'Sample data imported successfully',
                    output: stdout,
                }),
                {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        } catch (execError: any) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `Import failed: ${execError.message}`,
                    error: execError.stderr || execError.message,
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }
    } catch (error: any) {
        return new Response(
            JSON.stringify({
                success: false,
                message: error?.message || 'Failed to import sample data',
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
