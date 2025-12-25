import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { EnvConfig } from './validation';

/**
 * Secure configuration manager for storing environment variables
 * Note: In production, consider using proper encryption and secure storage
 */
export class ConfigManager {
    private configPath: string;
    private config: Partial<EnvConfig> = {};

    constructor() {
        // Store config in a .admin-config file in the project root
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        this.configPath = path.join(__dirname, '../../../.admin-config.json');
    }

    /**
     * Load configuration from file
     */
    async load(): Promise<Partial<EnvConfig>> {
        try {
            const data = await fs.readFile(this.configPath, 'utf-8');
            this.config = JSON.parse(data);
            return this.config;
        } catch (error) {
            // File doesn't exist or is invalid, return empty config
            return {};
        }
    }

    /**
     * Save configuration to file
     */
    async save(config: Partial<EnvConfig>): Promise<void> {
        this.config = { ...this.config, ...config };
        await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
    }

    /**
     * Get a specific configuration value
     */
    async get(key: keyof EnvConfig): Promise<string | undefined> {
        if (Object.keys(this.config).length === 0) {
            await this.load();
        }
        return this.config[key];
    }

    /**
     * Set a specific configuration value
     */
    async set(key: keyof EnvConfig, value: string): Promise<void> {
        if (Object.keys(this.config).length === 0) {
            await this.load();
        }
        this.config[key] = value;
        await this.save(this.config);
    }

    /**
     * Export configuration to .env file
     */
    async exportToEnv(envPath?: string): Promise<void> {
        const targetPath = envPath || path.join(path.dirname(this.configPath), '.env');
        
        const envContent = Object.entries(this.config)
            .map(([key, value]) => `${key}="${value}"`)
            .join('\n');

        await fs.writeFile(targetPath, envContent, 'utf-8');
    }

    /**
     * Import configuration from .env file
     */
    async importFromEnv(envPath?: string): Promise<Partial<EnvConfig>> {
        const targetPath = envPath || path.join(path.dirname(this.configPath), '.env');
        
        try {
            const content = await fs.readFile(targetPath, 'utf-8');
            const config: Partial<EnvConfig> = {};
            
            // Expected environment variable keys
            const validKeys = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_TOKEN', 'SANITY_STUDIO_PROJECT_ID', 'SANITY_STUDIO_DATASET'];
            
            content.split('\n').forEach(line => {
                const match = line.match(/^([A-Z_]+)=["']?(.+?)["']?$/);
                if (match) {
                    const [, key, value] = match;
                    if (validKeys.includes(key)) {
                        config[key as keyof EnvConfig] = value;
                    }
                }
            });

            await this.save(config);
            return config;
        } catch (error) {
            throw new Error('Failed to import .env file');
        }
    }

    /**
     * Clear all configuration
     */
    async clear(): Promise<void> {
        this.config = {};
        try {
            await fs.unlink(this.configPath);
        } catch (error) {
            // File doesn't exist, ignore
        }
    }

    /**
     * Auto-populate studio variables from main variables
     */
    async autoPopulateStudioVars(): Promise<void> {
        if (Object.keys(this.config).length === 0) {
            await this.load();
        }

        if (this.config.SANITY_PROJECT_ID && !this.config.SANITY_STUDIO_PROJECT_ID) {
            this.config.SANITY_STUDIO_PROJECT_ID = this.config.SANITY_PROJECT_ID;
        }

        if (this.config.SANITY_DATASET && !this.config.SANITY_STUDIO_DATASET) {
            this.config.SANITY_STUDIO_DATASET = this.config.SANITY_DATASET;
        }

        await this.save(this.config);
    }

    /**
     * Check if configuration exists
     */
    async exists(): Promise<boolean> {
        try {
            await fs.access(this.configPath);
            return true;
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const configManager = new ConfigManager();
