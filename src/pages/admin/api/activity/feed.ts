import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
    // TODO: Implement actual activity tracking
    // For now, return mock data
    const now = new Date();
    const activities = [
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
    ];

    return new Response(JSON.stringify({ activities }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
