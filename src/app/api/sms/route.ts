import { NextRequest, NextResponse } from 'next/server';

// Simple SMS proxy endpoint
export async function POST(request: NextRequest) {
  // Add CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Phone and message required' }, 
        { status: 400, headers }
      );
    }
    
    console.log('📱 SMS Proxy Request:', { 
      phone: phone.substring(0, 6) + '***', 
      messageLength: message.length 
    });

    // Try multiple Textbelt strategies
    const strategies = [
      { key: 'textbelt' },
      { key: '' },
      { key: 'demo' },
      { key: 'test' },
      { key: 'free' }
    ];
    
    for (const strategy of strategies) {
      try {
        const formData = new URLSearchParams({
          phone: phone,
          message: message,
          ...(strategy.key && { key: strategy.key })
        });
        
        const response = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          body: formData.toString(),
        });
        
        if (response.ok) {
          const result = await response.json();
          
          if (result && result.success) {
            console.log(`✅ SMS sent via ${strategy.key || 'no-key'}!`);
            return NextResponse.json(result, { headers });
          }
        }
        
      } catch (error) {
        console.warn(`Strategy ${strategy.key || 'no-key'} failed:`, error);
        continue;
      }
    }
    
    // If all strategies failed
    return NextResponse.json(
      { 
        error: 'All SMS strategies exhausted',
        success: false 
      }, 
      { status: 500, headers }
    );
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500, headers }
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

export async function GET() {
  return NextResponse.json(
    { message: 'SMS Proxy API v2.0 - Ready' },
    { 
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    }
  );
}
