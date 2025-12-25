import React from 'react';

interface Action {
    id: string;
    label: string;
    icon: string;
    href: string;
    description: string;
    color: string;
}

const actions: Action[] = [
    {
        id: 'new-page',
        label: 'Create New Page',
        icon: '📄',
        href: '/admin/page-builder',
        description: 'Build a new page with the visual editor',
        color: '#3b82f6',
    },
    {
        id: 'upload-media',
        label: 'Upload Media',
        icon: '🖼️',
        href: '/admin/studio',
        description: 'Add images and media assets',
        color: '#8b5cf6',
    },
    {
        id: 'add-content',
        label: 'Add Content',
        icon: '✍️',
        href: '/admin/content-manager',
        description: 'Create and manage content',
        color: '#10b981',
    },
    {
        id: 'settings',
        label: 'View Settings',
        icon: '⚙️',
        href: '/admin/settings',
        description: 'Configure system settings',
        color: '#f59e0b',
    },
];

export default function QuickActions() {
    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Quick Actions</h3>
            </div>
            
            <div className="admin-grid admin-grid-2" style={{ gap: '1rem' }}>
                {actions.map((action) => (
                    <a
                        key={action.id}
                        href={action.href}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            color: 'inherit',
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = action.color;
                            e.currentTarget.style.boxShadow = `0 4px 12px ${action.color}33`;
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '0.5rem',
                                background: action.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                flexShrink: 0,
                            }}
                        >
                            {action.icon}
                        </div>
                        <div>
                            <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                                {action.label}
                            </h4>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                {action.description}
                            </p>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
}
