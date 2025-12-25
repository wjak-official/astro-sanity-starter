import React, { useEffect, useState } from 'react';

interface Stats {
    totalPages: number;
    publishedPages: number;
    draftPages: number;
    totalAssets: number;
}

export default function Analytics() {
    const [stats, setStats] = useState<Stats>({
        totalPages: 0,
        publishedPages: 0,
        draftPages: 0,
        totalAssets: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await fetch('/admin/api/content/stats');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const statItems = [
        {
            label: 'Total Pages',
            value: stats.totalPages,
            icon: '📄',
            color: '#3b82f6',
        },
        {
            label: 'Published',
            value: stats.publishedPages,
            icon: '✅',
            color: '#10b981',
        },
        {
            label: 'Drafts',
            value: stats.draftPages,
            icon: '📝',
            color: '#f59e0b',
        },
        {
            label: 'Media Assets',
            value: stats.totalAssets,
            icon: '🖼️',
            color: '#8b5cf6',
        },
    ];

    if (loading) {
        return (
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Analytics</h3>
                </div>
                <div className="admin-loading">
                    <div className="admin-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card">
            <div className="admin-card-header">
                <h3 className="admin-card-title">Analytics</h3>
            </div>

            <div className="admin-grid admin-grid-4" style={{ gap: '1rem' }}>
                {statItems.map((item) => (
                    <div
                        key={item.label}
                        style={{
                            padding: '1rem',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            textAlign: 'center',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '2rem',
                                marginBottom: '0.5rem',
                            }}
                        >
                            {item.icon}
                        </div>
                        <div className="admin-stat-value" style={{ color: item.color }}>
                            {item.value}
                        </div>
                        <div className="admin-stat-label">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
