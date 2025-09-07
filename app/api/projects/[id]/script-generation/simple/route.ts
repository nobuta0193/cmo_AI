import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== Simple Script Generation API Called ===');
  console.log('Project ID:', params.id);
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    // モック台本データ
    const mockScriptData = {
      scripts: [{
        id: `script_${Date.now()}`,
        title: 'バリエーション A',
        content: '**【商品名】**\nテスト商品\n\n**【台本】**\nこれはテスト台本です。'
      }],
      selectedScript: `script_${Date.now()}`,
      evaluation: null
    };
    
    console.log('Returning mock script data');
    
    return NextResponse.json({
      success: true,
      content: mockScriptData.scripts[0].content,
      contentId: 'test-content-id',
      scriptData: mockScriptData
    });
    
  } catch (error) {
    console.error('Simple API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Simple API Error'
      },
      { status: 500 }
    );
  }
}
