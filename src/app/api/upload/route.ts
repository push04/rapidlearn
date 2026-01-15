import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { sendEvent } from '@/inngest/client';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const userId = formData.get('userId') as string | null;
        const title = formData.get('title') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        const supabase: any = createServerClient();
        const documentId = uuidv4();
        const fileName = file.name;
        const fileExtension = fileName.split('.').pop()?.toLowerCase();

        // Validate file type
        const allowedTypes = ['pdf', 'txt', 'md', 'docx'];
        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
            return NextResponse.json(
                { error: 'Invalid file type. Allowed: PDF, TXT, MD, DOCX' },
                { status: 400 }
            );
        }

        // Upload file to Supabase Storage
        const filePath = `documents/${userId}/${documentId}/${fileName}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('uploads')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        // Create document record
        const { error: dbError } = await supabase.from('documents').insert({
            id: documentId,
            user_id: userId,
            title: title || fileName,
            file_url: fileUrl,
            status: 'processing',
            metadata: {
                originalName: fileName,
                fileSize: file.size,
                fileType: file.type,
                uploadedAt: new Date().toISOString(),
            },
        });

        if (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Failed to create document record' },
                { status: 500 }
            );
        }

        // Trigger Inngest processing
        await sendEvent('document/uploaded', {
            documentId,
            userId,
            fileUrl,
            fileName,
        });

        return NextResponse.json({
            success: true,
            documentId,
            fileName,
            fileUrl,
            status: 'processing',
            message: 'Document uploaded and queued for processing',
        });
    } catch (error) {
        console.error('Upload API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get document status
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('documentId');

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID required' },
                { status: 400 }
            );
        }

        const supabase: any = createServerClient();

        const { data: document, error } = await supabase
            .from('documents')
            .select('*')
            .eq('id', documentId)
            .single();

        if (error) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        return NextResponse.json({ document });
    } catch (error) {
        console.error('Get document error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
