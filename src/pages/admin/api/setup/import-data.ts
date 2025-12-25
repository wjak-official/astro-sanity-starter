import type { APIRoute } from 'astro';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { activityTracker, ActivityTypes } from '@admin/utils/activity-tracker';

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

        // Validate project ID format to prevent command injection
        // Project ID must be lowercase alphanumeric, can contain hyphens
        // but not at start/end, and single char IDs are allowed
        if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(projectId)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Invalid project ID format',
                }),
                {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Path to the import script - validate it exists
        const importScript = path.join(process.cwd(), 'sanity-export', 'import.js');
        
        if (!fs.existsSync(importScript)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: 'Import script not found',
                }),
                {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
        }

        // Run the import command with safe argument passing using spawn
        try {
            const result = await new Promise<{ stdout: string; stderr: string; success: boolean }>((resolve, reject) => {
                const child = spawn('node', [importScript, projectId]);
                let stdout = '';
                let stderr = '';

                child.stdout.on('data', (data) => {
                    stdout += data.toString();
                });

                child.stderr.on('data', (data) => {
                    stderr += data.toString();
                });

                child.on('close', (code) => {
                    if (code === 0) {
                        resolve({ stdout, stderr, success: true });
                    } else {
                        resolve({ stdout, stderr, success: false });
                    }
                });

                child.on('error', (error) => {
                    reject(error);
                });
            });

            if (result.success) {
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
                        output: result.stdout,
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            } else {
                return new Response(
                    JSON.stringify({
                        success: false,
                        message: 'Import failed',
                        error: result.stderr || result.stdout,
                    }),
                    {
                        status: 500,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            }
        } catch (execError: any) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: `Import failed: ${execError.message}`,
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
