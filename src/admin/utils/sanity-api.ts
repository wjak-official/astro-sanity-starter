import { createClient, type SanityClient } from '@sanity/client';
import type { EnvConfig } from './validation';

/**
 * Sanity API utilities for admin operations
 */

/**
 * Create a Sanity client with the given configuration
 */
export function createSanityClient(config: Partial<EnvConfig>): SanityClient {
    return createClient({
        projectId: config.SANITY_PROJECT_ID,
        dataset: config.SANITY_DATASET || 'production',
        useCdn: false,
        apiVersion: '2024-01-31',
        token: config.SANITY_TOKEN,
    });
}

/**
 * Test Sanity connection with the given credentials
 */
export async function testSanityConnection(config: Partial<EnvConfig>): Promise<{
    success: boolean;
    message: string;
    details?: any;
}> {
    try {
        if (!config.SANITY_PROJECT_ID) {
            return {
                success: false,
                message: 'Project ID is required',
            };
        }

        if (!config.SANITY_DATASET) {
            return {
                success: false,
                message: 'Dataset is required',
            };
        }

        if (!config.SANITY_TOKEN) {
            return {
                success: false,
                message: 'API Token is required',
            };
        }

        const client = createSanityClient(config);

        // Try to fetch project info
        const result = await client.request({
            url: `/projects/${config.SANITY_PROJECT_ID}`,
            method: 'GET',
        });

        // Try a simple query to test permissions
        await client.fetch('*[_type == "page"][0..1]');

        return {
            success: true,
            message: 'Connection successful',
            details: {
                projectId: config.SANITY_PROJECT_ID,
                dataset: config.SANITY_DATASET,
                projectName: result.displayName,
            },
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Connection failed',
            details: error,
        };
    }
}

/**
 * Create a new Sanity project via Management API
 */
export async function createSanityProject(params: {
    token: string;
    projectName: string;
    dataset?: string;
    organizationId?: string;
}): Promise<{
    success: boolean;
    projectId?: string;
    dataset?: string;
    message?: string;
    error?: any;
}> {
    const { token, projectName, dataset = 'production', organizationId } = params;

    try {
        const client = createClient({
            useProjectHostname: false,
            apiVersion: '2024-01-31',
            token: token,
            useCdn: false,
        });

        // Create project
        const projectBody: any = {
            displayName: projectName,
        };

        if (organizationId) {
            projectBody.organizationId = organizationId;
        }

        const project = await client.request({
            url: '/projects',
            method: 'POST',
            body: projectBody,
        });

        // Create dataset
        await client.request({
            url: `/projects/${project.id}/datasets/${dataset}`,
            method: 'PUT',
            body: {
                aclMode: 'public',
            },
        });

        return {
            success: true,
            projectId: project.id,
            dataset: dataset,
            message: 'Project created successfully',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to create project',
            error,
        };
    }
}

/**
 * Get project details
 */
export async function getProjectInfo(config: Partial<EnvConfig>): Promise<{
    success: boolean;
    data?: any;
    message?: string;
}> {
    try {
        const client = createSanityClient(config);
        const projectInfo = await client.request({
            url: `/projects/${config.SANITY_PROJECT_ID}`,
            method: 'GET',
        });

        return {
            success: true,
            data: projectInfo,
        };
    } catch (error: any) {
        return {
            success: false,
            message: error?.message || 'Failed to fetch project info',
        };
    }
}

/**
 * Get content statistics
 */
export async function getContentStats(config: Partial<EnvConfig>): Promise<{
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    totalAssets: number;
}> {
    try {
        const client = createSanityClient(config);

        const [allPages, publishedPages, assets] = await Promise.all([
            client.fetch('count(*[_type == "page"])'),
            client.fetch('count(*[_type == "page" && !(_id in path("drafts.**"))])'),
            client.fetch('count(*[_type == "sanity.imageAsset"])'),
        ]);

        return {
            totalPages: allPages || 0,
            publishedPages: publishedPages || 0,
            draftPages: (allPages || 0) - (publishedPages || 0),
            totalAssets: assets || 0,
        };
    } catch (error) {
        return {
            totalPages: 0,
            publishedPages: 0,
            draftPages: 0,
            totalAssets: 0,
        };
    }
}

/**
 * Get recent pages
 */
export async function getRecentPages(config: Partial<EnvConfig>, limit = 5): Promise<any[]> {
    try {
        const client = createSanityClient(config);
        const pages = await client.fetch(
            `*[_type == "page"] | order(_updatedAt desc) [0..${limit - 1}] {
                _id,
                title,
                slug,
                _updatedAt,
                _createdAt
            }`
        );
        return pages || [];
    } catch (error) {
        return [];
    }
}
