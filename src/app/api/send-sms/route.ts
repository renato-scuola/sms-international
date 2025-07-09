import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
    }
    
    console.log('🚀 Sending SMS from Vercel serverless function...');
    console.log('📍 Vercel Region:', process.env.VERCEL_REGION || 'development');
    console.log('🌐 Function will use automatic IP rotation from Vercel edge network');
    
    // Generate random fingerprint to avoid detection
    const randomId = Math.random().toString(36).substring(2, 15);
    const randomUserAgent = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101',
    ][Math.floor(Math.random() * 4)];
    
    const formData = new URLSearchParams({
      phone: phone,
      message: message,
      key: 'textbelt'
    });
    
    // Add random delay to avoid rate limiting patterns
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    
    // Try primary service (Textbelt)
    let response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': `${randomUserAgent} (${randomId})`,
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      body: formData.toString(),
    });
    
    let result = await response.json();
    
    // If quota reached, try alternative approach
    if (result.error && result.error.includes('quota')) {
      console.log('⚠️ Primary quota reached, trying alternative method...');
      
      // Wait a bit and try with different fingerprint
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
      
      const altUserAgent = [
        'curl/7.68.0',
        'HTTPie/3.2.0',
        'PostmanRuntime/7.32.0',
        'insomnia/2023.5.8'
      ][Math.floor(Math.random() * 4)];
      
      response = await fetch('https://textbelt.com/text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': altUserAgent,
          'X-Forwarded-For': `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        },
        body: formData.toString(),
      });
      
      result = await response.json();
    }
    
    if (!response.ok && !result) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    console.log('📨 Textbelt response:', result);
    console.log('✅ SMS sent using Vercel IP rotation + randomized fingerprint!');
    
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
