import React, { useState, useEffect } from 'react';

interface EnvVariable {
    key: string;
    value: string;
    masked: boolean;
    description: string;
}

const defaultEnvVars: EnvVariable[] = [
    {
        key: 'SANITY_PROJECT_ID',
        value: '',
        masked: false,
        description: 'Your Sanity project ID',
    },
    {
        key: 'SANITY_DATASET',
        value: '',
        masked: false,
        description: 'Dataset name (e.g., production)',
    },
    {
        key: 'SANITY_TOKEN',
        value: '',
        masked: true,
        description: 'API token for Sanity (read/write)',
    },
];

export default function EnvironmentManager() {
    const [envVars, setEnvVars] = useState<EnvVariable[]>(defaultEnvVars);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
        null
    );

    useEffect(() => {
        loadConfiguration();
    }, []);

    const loadConfiguration = async () => {
        setLoading(true);
        try {
            const response = await fetch('/admin/api/env/load');
            if (response.ok) {
                const data = await response.json();
                if (data.config) {
                    updateEnvVarsWithConfig(data.config);
                }
            }
        } catch (error) {
            console.error('Failed to load configuration:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateEnvVarsWithConfig = (config: any) => {
        setEnvVars((prevVars) =>
            prevVars.map((envVar) => ({
                ...envVar,
                value: config[envVar.key] || '',
            }))
        );
    };

    const handleValueChange = (key: string, value: string) => {
        setEnvVars((prevVars) =>
            prevVars.map((envVar) =>
                envVar.key === key ? { ...envVar, value } : envVar
            )
        );
        setMessage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        const config = envVars.reduce((acc, envVar) => {
            if (envVar.value) {
                acc[envVar.key] = envVar.value;
            }
            return acc;
        }, {} as Record<string, string>);

        try {
            const response = await fetch('/admin/api/env/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: 'Configuration saved successfully!' });
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to save configuration',
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setTesting(true);
        setMessage(null);

        const config = envVars.reduce((acc, envVar) => {
            if (envVar.value) {
                acc[envVar.key] = envVar.value;
            }
            return acc;
        }, {} as Record<string, string>);

        try {
            const response = await fetch('/admin/api/env/test-connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(config),
            });

            const data = await response.json();

            if (data.success) {
                setMessage({
                    type: 'success',
                    text: `Connection successful! ${data.details?.projectName || ''}`,
                });
            } else {
                setMessage({
                    type: 'error',
                    text: data.message || 'Connection failed',
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to test connection' });
        } finally {
            setTesting(false);
        }
    };

    if (loading) {
        return (
            <div className="env-manager">
                <div className="admin-loading">
                    <div className="admin-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="env-manager">
            <div className="env-manager-header">
                <div>
                    <h2 className="env-manager-title">Environment Configuration</h2>
                    <p className="env-manager-subtitle">
                        Manage your Sanity connection settings
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={handleTestConnection}
                        disabled={testing}
                        className="admin-button admin-button-secondary"
                    >
                        {testing ? '🔄 Testing...' : '🔌 Test Connection'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="admin-button admin-button-primary"
                    >
                        {saving ? '💾 Saving...' : '💾 Save Configuration'}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`env-manager-message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="env-manager-content">
                {envVars.map((envVar) => (
                    <div key={envVar.key} className="env-var-group">
                        <label htmlFor={envVar.key} className="env-var-label">
                            {envVar.key}
                            {envVar.masked && (
                                <span
                                    style={{
                                        marginLeft: '0.5rem',
                                        fontSize: '0.75rem',
                                        color: '#f59e0b',
                                    }}
                                >
                                    🔒 Sensitive
                                </span>
                            )}
                        </label>
                        <p className="env-var-description">{envVar.description}</p>
                        <input
                            type={envVar.masked ? 'password' : 'text'}
                            id={envVar.key}
                            value={envVar.value}
                            onChange={(e) => handleValueChange(envVar.key, e.target.value)}
                            placeholder={`Enter ${envVar.key}`}
                            className="env-var-input"
                        />
                    </div>
                ))}
            </div>

            <div className="env-manager-info">
                <div className="info-box">
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                        <strong>💡 Tip:</strong> Your configuration is stored securely and
                        automatically synced to <code>.env</code> file.
                    </p>
                </div>
                <div className="info-box">
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>
                        <strong>🔐 Security:</strong> Sensitive values are masked in the UI and
                        stored in a secure configuration file.
                    </p>
                </div>
            </div>
        </div>
    );
}
