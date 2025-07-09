import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
    }
    
    console.log('Sending SMS from Vercel function with automatic IP rotation...');
    
    const formData = new URLSearchParams({
      phone: phone,
      message: message,
      key: 'textbelt'
    });
    
    // Each Vercel function execution uses different server IPs automatically
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `VercelSMS-${Date.now()}`,
      },
      body: formData.toString(),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('Textbelt response:', result);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('SMS sending error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
