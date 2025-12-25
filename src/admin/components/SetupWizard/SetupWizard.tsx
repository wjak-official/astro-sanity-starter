import React, { useState } from 'react';

interface Step {
    id: number;
    title: string;
    description: string;
}

const steps: Step[] = [
    { id: 1, title: 'Welcome', description: 'Get started with the setup' },
    { id: 2, title: 'Authentication', description: 'Connect to Sanity' },
    { id: 3, title: 'Project Setup', description: 'Create or select project' },
    { id: 4, title: 'Import Data', description: 'Load sample content' },
    { id: 5, title: 'Complete', description: 'All set!' },
];

export default function SetupWizard() {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Step 2: Authentication
    const [sanityToken, setSanityToken] = useState('');

    // Step 3: Project
    const [projectMode, setProjectMode] = useState<'create' | 'existing'>('create');
    const [projectName, setProjectName] = useState('');
    const [projectId, setProjectId] = useState('');
    const [dataset, setDataset] = useState('production');
    const [organizationId, setOrganizationId] = useState('');

    const nextStep = () => {
        setError('');
        setSuccess('');
        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        setError('');
        setSuccess('');
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCreateProject = async () => {
        if (!projectName || !sanityToken) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/admin/api/setup/create-project', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: sanityToken,
                    projectName,
                    dataset,
                    organizationId: organizationId || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setProjectId(data.projectId || '');
                setSuccess(`Project created successfully! ID: ${data.projectId}`);
                
                await saveConfiguration(data.projectId, dataset, sanityToken);
            } else {
                setError(data.message || 'Failed to create project');
            }
        } catch (err: any) {
            setError('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const handleUseExisting = async () => {
        if (!projectId || !dataset || !sanityToken) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/admin/api/env/test-connection', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    SANITY_PROJECT_ID: projectId,
                    SANITY_DATASET: dataset,
                    SANITY_TOKEN: sanityToken,
                }),
            });

            const data = await response.json();

            if (data.success) {
                await saveConfiguration(projectId, dataset, sanityToken);
                setSuccess('Configuration saved successfully!');
            } else {
                setError(data.message || 'Failed to connect to project');
            }
        } catch (err: any) {
            setError('Failed to save configuration');
        } finally {
            setLoading(false);
        }
    };

    const saveConfiguration = async (pid: string, ds: string, token: string) => {
        const response = await fetch('/admin/api/setup/save-config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                projectId: pid,
                dataset: ds,
                token: token,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to save configuration');
        }
    };

    const handleImportData = async () => {
        if (!projectId) {
            setError('Project ID is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/admin/api/setup/import-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Sample data imported successfully!');
            } else {
                setError(data.message || 'Failed to import data');
            }
        } catch (err: any) {
            setError('Failed to import data');
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="wizard-step">
                        <h2 className="wizard-step-title">Welcome to the Setup Wizard</h2>
                        <p className="wizard-step-description">
                            This wizard will help you configure your Astro Sanity site in just a few steps:
                        </p>
                        <ul style={{ margin: '1.5rem 0', paddingLeft: '1.5rem', color: '#4b5563' }}>
                            <li>Connect to Sanity using your API token</li>
                            <li>Create a new project or use an existing one</li>
                            <li>Import sample content to get started quickly</li>
                        </ul>
                        <div className="info-box" style={{ marginTop: '1.5rem' }}>
                            <p style={{ margin: 0 }}>
                                <strong>Need a Sanity token?</strong><br />
                                Visit <a href="https://www.sanity.io/manage" target="_blank" rel="noopener noreferrer">sanity.io/manage</a> to create one.
                            </p>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="wizard-step">
                        <h2 className="wizard-step-title">Authenticate with Sanity</h2>
                        <p className="wizard-step-description">
                            Enter your Sanity API token to connect your account.
                        </p>
                        <div className="form-group">
                            <label htmlFor="sanityToken">Sanity API Token *</label>
                            <input
                                type="password"
                                id="sanityToken"
                                value={sanityToken}
                                onChange={(e) => setSanityToken(e.target.value)}
                                placeholder="sk..."
                                className="form-input"
                            />
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.5rem 0 0' }}>
                                Get your token from the <a href="https://www.sanity.io/manage" target="_blank" rel="noopener noreferrer">Sanity Management Console</a>
                            </p>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="wizard-step">
                        <h2 className="wizard-step-title">Project Setup</h2>
                        <p className="wizard-step-description">
                            Create a new Sanity project or use an existing one.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => setProjectMode('create')}
                                className={`mode-button ${projectMode === 'create' ? 'active' : ''}`}
                            >
                                Create New Project
                            </button>
                            <button
                                onClick={() => setProjectMode('existing')}
                                className={`mode-button ${projectMode === 'existing' ? 'active' : ''}`}
                            >
                                Use Existing Project
                            </button>
                        </div>

                        {projectMode === 'create' ? (
                            <>
                                <div className="form-group">
                                    <label htmlFor="projectName">Project Name *</label>
                                    <input
                                        type="text"
                                        id="projectName"
                                        value={projectName}
                                        onChange={(e) => setProjectName(e.target.value)}
                                        placeholder="My Awesome Site"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dataset">Dataset</label>
                                    <input
                                        type="text"
                                        id="dataset"
                                        value={dataset}
                                        onChange={(e) => setDataset(e.target.value)}
                                        placeholder="production"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="organizationId">Organization ID (optional)</label>
                                    <input
                                        type="text"
                                        id="organizationId"
                                        value={organizationId}
                                        onChange={(e) => setOrganizationId(e.target.value)}
                                        placeholder="Leave empty for personal projects"
                                        className="form-input"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateProject}
                                    disabled={loading}
                                    className="wizard-button wizard-button-primary"
                                >
                                    {loading ? 'Creating...' : 'Create Project'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label htmlFor="existingProjectId">Project ID *</label>
                                    <input
                                        type="text"
                                        id="existingProjectId"
                                        value={projectId}
                                        onChange={(e) => setProjectId(e.target.value)}
                                        placeholder="abc123xyz"
                                        className="form-input"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="existingDataset">Dataset *</label>
                                    <input
                                        type="text"
                                        id="existingDataset"
                                        value={dataset}
                                        onChange={(e) => setDataset(e.target.value)}
                                        placeholder="production"
                                        className="form-input"
                                    />
                                </div>
                                <button
                                    onClick={handleUseExisting}
                                    disabled={loading}
                                    className="wizard-button wizard-button-primary"
                                >
                                    {loading ? 'Connecting...' : 'Connect to Project'}
                                </button>
                            </>
                        )}
                    </div>
                );

            case 4:
                return (
                    <div className="wizard-step">
                        <h2 className="wizard-step-title">Import Sample Data</h2>
                        <p className="wizard-step-description">
                            Import sample content to get started with your site quickly.
                        </p>
                        {projectId && (
                            <div className="info-box" style={{ marginBottom: '1.5rem' }}>
                                <p style={{ margin: 0 }}>
                                    <strong>Project ID:</strong> {projectId}<br />
                                    <strong>Dataset:</strong> {dataset}
                                </p>
                            </div>
                        )}
                        <button
                            onClick={handleImportData}
                            disabled={loading || !projectId}
                            className="wizard-button wizard-button-primary"
                        >
                            {loading ? 'Importing...' : 'Import Sample Data'}
                        </button>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '1rem' }}>
                            You can skip this step if you prefer to start with an empty project.
                        </p>
                    </div>
                );

            case 5:
                return (
                    <div className="wizard-step">
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
                            <h2 className="wizard-step-title">Setup Complete!</h2>
                            <p className="wizard-step-description">
                                Your Astro Sanity site is now configured and ready to use.
                            </p>
                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <a
                                    href="/admin/dashboard"
                                    className="wizard-button wizard-button-primary"
                                >
                                    Go to Dashboard
                                </a>
                                <a
                                    href="/admin/studio"
                                    className="wizard-button wizard-button-secondary"
                                >
                                    Open Content Studio
                                </a>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="setup-wizard-container">
            <div className="wizard-progress">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className={`wizard-progress-step ${
                            step.id === currentStep ? 'active' : step.id < currentStep ? 'completed' : ''
                        }`}
                    >
                        <div className="wizard-progress-number">{step.id}</div>
                        <div className="wizard-progress-label">
                            <div className="wizard-progress-title">{step.title}</div>
                            <div className="wizard-progress-desc">{step.description}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="wizard-content">
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}

                {renderStepContent()}

                <div className="wizard-actions">
                    {currentStep > 1 && currentStep < steps.length && (
                        <button
                            onClick={prevStep}
                            className="wizard-button wizard-button-secondary"
                        >
                            Back
                        </button>
                    )}
                    {currentStep < steps.length && (
                        <button
                            onClick={nextStep}
                            className="wizard-button wizard-button-primary"
                            disabled={currentStep === 2 && !sanityToken}
                        >
                            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
