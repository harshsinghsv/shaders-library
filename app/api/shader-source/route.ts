import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse('Missing shader id', { status: 400 });
    }

    // Sanitize the id to prevent directory traversal
    const sanitizedId = id.replace(/[^a-zA-Z0-9-]/g, '');
    const shaderPath = path.join(process.cwd(), 'components', 'shaders', sanitizedId, 'Hero.tsx');

    try {
        const code = fs.readFileSync(shaderPath, 'utf-8');
        return new NextResponse(code, {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch {
        return new NextResponse('Shader not found', { status: 404 });
    }
}
