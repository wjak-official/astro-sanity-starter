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

interface SanityProjectInfo {
    projectId: string;
    dataset: string;
    projectName: string;
}

/**
 * Test Sanity connection with the given credentials
 */
export async function testSanityConnection(config: Partial<EnvConfig>): Promise<{
    success: boolean;
    message: string;
    details?: SanityProjectInfo | Record<string, unknown>;
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
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        return {
            success: false,
            message: errorMessage,
            details: error instanceof Error ? { error: error.message } : {},
        };
    }
}

interface CreateProjectBody {
    displayName: string;
    organizationId?: string;
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
    error?: string;
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
        const projectBody: CreateProjectBody = {
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
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to create project';
        return {
            success: false,
            message: errorMessage,
            error: errorMessage,
        };
    }
}

/**
 * Get project details
 */
export async function getProjectInfo(config: Partial<EnvConfig>): Promise<{
    success: boolean;
    data?: Record<string, unknown>;
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
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch project info';
        return {
            success: false,
            message: errorMessage,
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

interface SanityPage {
    _id: string;
    title: string;
    slug?: { current?: string };
    _updatedAt: string;
    _createdAt: string;
}

/**
 * Get recent pages
 */
export async function getRecentPages(config: Partial<EnvConfig>, limit = 5): Promise<SanityPage[]> {
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
