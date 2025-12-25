import React, { useState } from 'react';

interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: string;
}

interface SidebarProps {
    currentPath?: string;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', href: '/admin', icon: '📊' },
    { id: 'setup-wizard', label: 'Setup Wizard', href: '/admin/setup-wizard', icon: '🧙' },
    { id: 'content-manager', label: 'Content Manager', href: '/admin/content-manager', icon: '📝' },
    { id: 'page-builder', label: 'Page Builder', href: '/admin/page-builder', icon: '🏗️' },
    { id: 'studio', label: 'Content Studio', href: '/admin/studio', icon: '🎨' },
    { id: 'plugins', label: 'Plugins', href: '/admin/plugins', icon: '🔌' },
    { id: 'settings', label: 'Settings', href: '/admin/settings', icon: '⚙️' },
];

export default function Sidebar({ currentPath = '' }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (href: string) => {
        if (href === '/admin') {
            return currentPath === '/admin' || currentPath === '/admin/';
        }
        return currentPath.startsWith(href);
    };

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="admin-sidebar-header">
                <h1 className="admin-sidebar-logo">
                    {collapsed ? 'AS' : 'Astro Sanity'}
                </h1>
            </div>

            <nav className="admin-sidebar-nav">
                {navItems.map((item) => (
                    <a
                        key={item.id}
                        href={item.href}
                        className={`admin-nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                        <span className="admin-nav-icon">{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </a>
                ))}
            </nav>

            <div style={{ padding: '1rem' }}>
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="admin-button admin-button-secondary"
                    style={{ width: '100%', fontSize: '0.875rem' }}
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>
        </aside>
    );
}
