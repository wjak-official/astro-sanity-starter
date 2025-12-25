import { z } from 'zod';

/**
 * Environment variable validation schemas
 */
export const envVariableSchema = z.object({
    key: z.string().min(1),
    value: z.string(),
    description: z.string().optional(),
    required: z.boolean().default(false),
    masked: z.boolean().default(false),
});

export const envConfigSchema = z.object({
    SANITY_PROJECT_ID: z.string().min(1, 'Project ID is required'),
    SANITY_DATASET: z.string().min(1, 'Dataset is required'),
    SANITY_TOKEN: z.string().min(1, 'API Token is required'),
    SANITY_STUDIO_PROJECT_ID: z.string().optional(),
    SANITY_STUDIO_DATASET: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envConfigSchema>;

/**
 * Sanity project creation schema
 */
export const createProjectSchema = z.object({
    projectName: z.string().min(1, 'Project name is required'),
    dataset: z.string().default('production'),
    organizationId: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Authentication schemas
 */
export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const sessionSchema = z.object({
    userId: z.string(),
    username: z.string(),
    expiresAt: z.number(),
});

export type SessionData = z.infer<typeof sessionSchema>;

/**
 * Validation helper functions
 */
export function validateEnvConfig(config: unknown): EnvConfig {
    return envConfigSchema.parse(config);
}

export function validateProjectInput(input: unknown): CreateProjectInput {
    return createProjectSchema.parse(input);
}

/**
 * Sanity project ID validation
 */
export function isValidProjectId(projectId: string): boolean {
    return /^[a-z0-9][-a-z0-9]*$/.test(projectId);
}

/**
 * Sanity dataset validation
 */
export function isValidDataset(dataset: string): boolean {
    return /^[a-z0-9_][-a-z0-9_]*$/.test(dataset);
}
