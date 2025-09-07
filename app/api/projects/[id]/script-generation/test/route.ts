import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== Test API Called ===');
  console.log('Project ID:', params.id);
  
  return NextResponse.json({
    success: true,
    message: 'Test API is working',
    projectId: params.id,
    timestamp: new Date().toISOString()
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== Test POST API Called ===');
  console.log('Project ID:', params.id);
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test POST API is working',
      projectId: params.id,
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test API Error:', error);
    return NextResponse.json(
      { error: 'Test API Error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
