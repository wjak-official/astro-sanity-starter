import type { APIRoute } from 'astro';
import { configManager } from '../../../admin/utils/config-manager';
import { validateEnvConfig } from '../../../admin/utils/validation';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();
        
        // Validate the configuration
        const validatedConfig = validateEnvConfig(body);

        // Save the configuration
        await configManager.save(validatedConfig);

        // Auto-populate studio variables
        await configManager.autoPopulateStudioVars();

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
                error: error?.message || 'Failed to save configuration',
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
