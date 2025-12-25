import React from 'react';

interface TopBarProps {
    title?: string;
    userName?: string;
}

export default function TopBar({ title = 'Admin Dashboard', userName = 'Admin' }: TopBarProps) {
    return (
        <header className="admin-topbar">
            <div className="admin-topbar-left">
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                    {title}
                </h2>
            </div>

            <div className="admin-topbar-right">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        👤 {userName}
                    </span>
                    <button
                        onClick={() => {
                            window.location.href = '/admin/logout';
                        }}
                        className="admin-button admin-button-secondary"
                        style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
}
