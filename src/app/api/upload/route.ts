import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { checkInternalAccess } from '@/lib/auth-server';

export async function POST(request: Request) {
    if (!await checkInternalAccess()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`;
        const path = join(uploadDir, filename);

        await writeFile(path, buffer);
        console.log(`File uploaded to ${path}`);

        const url = `/uploads/${filename}`;
        return NextResponse.json({ url });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
