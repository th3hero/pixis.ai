import { NextRequest, NextResponse } from 'next/server';
import { createPPTX } from '@/src/lib/slides/slide-engine';
import { GeneratedDeck } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { deck } = body as { deck: GeneratedDeck };

    if (!deck || !deck.slides || deck.slides.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No presentation data provided' },
        { status: 400 }
      );
    }

    // Generate PPTX
    const pptxBuffer = await createPPTX(deck);
    const fileName = `${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pptx`;

    // Return the file as a downloadable response
    return new NextResponse(new Uint8Array(pptxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export presentation',
      },
      { status: 500 }
    );
  }
}
