import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { checkInternalAccess } from '@/lib/auth-server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    if (!await checkInternalAccess()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Generate unique filename
        const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

        // Upload to Supabase Storage
        // Make sure you have created a bucket named 'image' and set it to public
        const { data, error } = await supabase.storage
            .from('image')
            .upload(filename, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Supabase upload error:', error);
            return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from('image')
            .getPublicUrl(filename);

        console.log(`File uploaded to Supabase: ${publicUrl}`);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
