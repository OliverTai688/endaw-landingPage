import { NextResponse } from 'next/server';
import { RepositoryFactory } from '@/infrastructure/RepositoryFactory';
import { ContentService } from '@/application/use-cases/ContentUseCases';
import { ContentType, PublishStatus, ContentEntity } from '@/domain/models/Content';
import { checkInternalAccess } from '@/lib/auth-server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') as ContentType;
        const isInternal = await checkInternalAccess();

        const repo = await RepositoryFactory.getRepository();
        const service = new ContentService(repo);
        let items = await service.getContentsByType(type);

        // If not authenticated, only show PUBLISHED items
        if (!isInternal) {
            items = items.filter(item => item.publishStatus === PublishStatus.PUBLISHED);
        }

        return NextResponse.json(items);
    } catch (error: any) {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        console.error('API GET Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            debug: { type, location: 'GET /api/content' }
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!await checkInternalAccess()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await request.json();
    const repo = await RepositoryFactory.getRepository();
    const service = new ContentService(repo);
    const created = await service.createContent(data);
    return NextResponse.json(created);
}

export async function PUT(request: Request) {
    if (!await checkInternalAccess()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const data = await request.json();
    const { id, ...updates } = data;

    const repo = await RepositoryFactory.getRepository();
    const service = new ContentService(repo);
    const updated = await service.updateContent(id, updates);
    return NextResponse.json(updated);
}

export async function PATCH(request: Request) {
    if (!await checkInternalAccess()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const action = searchParams.get('action');

    if (id && action === 'togglePublish') {
        const repo = await RepositoryFactory.getRepository();
        const service = new ContentService(repo);
        const updated = await service.togglePublishStatus(id);
        return NextResponse.json(updated);
    }

    if (id && action === 'setStatus') {
        const { status } = await request.json();
        const repo = await RepositoryFactory.getRepository();
        const service = new ContentService(repo);
        const updated = await service.setStatus(id, status as PublishStatus);
        return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function DELETE(request: Request) {
    if (!await checkInternalAccess()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const repo = await RepositoryFactory.getRepository();
    const service = new ContentService(repo);
    await service.deleteContent(id);
    return NextResponse.json({ success: true });
}
