import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 });
    }
    
    console.log('📱 SMS Request:', { 
      phone: phone.substring(0, 6) + '***', 
      messageLength: message.length 
    });

    // Simple proxy to Textbelt - try multiple strategies
    const strategies = [
      { key: 'textbelt', name: 'primary' },
      { key: '', name: 'no-key' },
      { key: 'demo', name: 'demo' },
      { key: 'test', name: 'test' },
      { key: 'free', name: 'free' }
    ];
    
    for (const strategy of strategies) {
      try {
        console.log(`📡 Trying: ${strategy.name}`);
        
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
            'Accept': 'application/json',
            'Origin': 'https://textbelt.com',
            'Referer': 'https://textbelt.com/',
          },
          body: formData.toString(),
        });
        
        if (!response.ok) {
          console.warn(`⚠️ ${strategy.name} HTTP error:`, response.status);
          continue;
        }
        
        const result = await response.json();
        console.log(`🎯 ${strategy.name} Result:`, result);
        
        if (result && result.success) {
          console.log(`✅ SMS sent via ${strategy.name}!`);
          return NextResponse.json(result);
        } else if (result?.error?.includes('quota') || result?.error?.includes('limit')) {
          console.warn(`📊 ${strategy.name} quota exhausted, trying next...`);
          continue;
        } else {
          console.warn(`⚠️ ${strategy.name} failed:`, result?.error);
          continue;
        }
        
      } catch (strategyError) {
        console.error(`💀 ${strategy.name} error:`, strategyError);
        continue;
      }
    }
    
    // If all strategies failed
    return NextResponse.json({ 
      error: 'All SMS strategies exhausted',
      success: false,
      suggestion: 'Try again later or consider getting a paid Textbelt API key'
    }, { status: 500 });
    
  } catch (error) {
    console.error('💀 API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'SMS API is running' });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
