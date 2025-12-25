import React, { useEffect, useState } from 'react';

interface Page {
    _id: string;
    title: string;
    slug?: { current?: string };
    _updatedAt: string;
    _createdAt: string;
}

const getStudioEditUrl = (pageId: string): string => {
    const cleanId = pageId.replace('drafts.', '');
    return `/admin/studio/desk/page;${cleanId}`;
};

export default function RecentPages() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecentPages();
    }, []);

    const fetchRecentPages = async () => {
        try {
            const response = await fetch('/admin/api/content/recent-pages');
            if (response.ok) {
                const data = await response.json();
                setPages(data.pages || []);
            }
        } catch (error) {
            console.error('Failed to fetch recent pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const isDraft = (id: string) => id.startsWith('drafts.');

    if (loading) {
        return (
            <div className="admin-card">
                <div className="admin-card-header">
                    <h3 className="admin-card-title">Recent Pages</h3>
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
                <h3 className="admin-card-title">Recent Pages</h3>
                <a
                    href="/admin/content-manager"
                    style={{
                        fontSize: '0.875rem',
                        color: '#3b82f6',
                        textDecoration: 'none',
                    }}
                >
                    View all →
                </a>
            </div>

            {pages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem 0' }}>
                    No pages yet. Create your first page!
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {pages.slice(0, 5).map((page) => (
                        <div
                            key={page._id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.75rem',
                                border: '1px solid #e5e7eb',
                                borderRadius: '0.375rem',
                                transition: 'all 0.2s',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.borderColor = '#3b82f6';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.borderColor = '#e5e7eb';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600 }}>
                                    {page.title || 'Untitled'}
                                </h4>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                                    Updated: {formatDate(page._updatedAt)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span
                                    style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '0.25rem',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        background: isDraft(page._id) ? '#fef3c7' : '#d1fae5',
                                        color: isDraft(page._id) ? '#92400e' : '#065f46',
                                    }}
                                >
                                    {isDraft(page._id) ? 'Draft' : 'Published'}
                                </span>
                                <a
                                    href={getStudioEditUrl(page._id)}
                                    className="admin-button admin-button-primary"
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                >
                                    Edit
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
