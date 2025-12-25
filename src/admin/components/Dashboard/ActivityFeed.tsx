import React, { useEffect, useState } from 'react';

interface Activity {
    id: string;
    type: string;
    message: string;
    timestamp: string;
    icon: string;
}

export default function ActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await fetch('/admin/api/activity/feed');
            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
            }
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            // Use mock data for now
            setActivities(getMockActivities());
        } finally {
            setLoading(false);
        }
    };

    const getMockActivities = (): Activity[] => {
        const now = new Date();
        return [
            {
                id: '1',
                type: 'page_created',
                message: 'New page "About Us" was created',
                timestamp: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
                icon: '📄',
            },
            {
                id: '2',
                type: 'media_uploaded',
                message: 'Uploaded 3 new images',
                timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
                icon: '🖼️',
            },
            {
                id: '3',
                type: 'page_published',
                message: 'Page "Home" was published',
                timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
                icon: '✅',
            },
            {
                id: '4',
                type: 'settings_updated',
                message: 'System settings were updated',
                timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString(),
                icon: '⚙️',
            },
        ];
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now.getTime() - past.getTime();
        const diffMins = Math.floor(diffMs / 1000 / 60);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Activity Feed</h3>
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
                <h3 className="admin-card-title">Activity Feed</h3>
            </div>

            {activities.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>
                    No recent activity
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activities.slice(0, 10).map((activity) => (
                        <div
                            key={activity.id}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                            }}
                        >
                            <div
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem',
                                    flexShrink: 0,
                                }}
                            >
                                {activity.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.875rem' }}>
                                    {activity.message}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>
                                    {formatTimeAgo(activity.timestamp)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
