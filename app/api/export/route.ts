import { NextRequest, NextResponse } from 'next/server';
import { createPPTX } from '@/src/lib/slides/slide-engine';
import { GeneratedDeck } from '@/src/types';

export async function POST(request: NextRequest) {
  try {
    const { deck } = await request.json() as { deck: GeneratedDeck };

    if (!deck?.slides?.length) {
      return NextResponse.json({ success: false, error: 'No presentation data provided' }, { status: 400 });
    }

    const pptxBuffer = await createPPTX(deck);
    const filename = `${deck.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pptx`;

    return new NextResponse(new Uint8Array(pptxBuffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Failed to export' },
      { status: 500 }
    );
  }
}
