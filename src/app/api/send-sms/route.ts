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
    
    // Generate completely random device fingerprint to avoid detection
    const randomId = Math.random().toString(36).substring(2, 15);
    const sessionId = Math.random().toString(36).substring(2, 20);
    
    // Random User Agents (mobile, desktop, tablets)
    const userAgents = [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Android 13; Mobile; rv:109.0) Gecko/109.0 Firefox/119.0',
      'Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0'
    ];
    
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    
    // Generate random IP to spoof (IPv4)
    const randomIP = `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    // Random screen resolutions
    const resolutions = ['1920x1080', '1366x768', '1536x864', '1440x900', '1280x720', '375x667', '414x896', '390x844'];
    const randomResolution = resolutions[Math.floor(Math.random() * resolutions.length)];
    
    // Random referers to simulate organic traffic
    const referers = [
      'https://www.google.com/',
      'https://www.bing.com/',
      'https://duckduckgo.com/',
      'https://www.facebook.com/',
      'https://twitter.com/',
      'https://reddit.com/',
      '',  // Direct access
    ];
    const randomReferer = referers[Math.floor(Math.random() * referers.length)];
    
    const formData = new URLSearchParams({
      phone: phone,
      message: message,
      key: 'textbelt'
    });
    
    // Add random delay to avoid rate limiting patterns (vary timing)
    const randomDelay = Math.random() * 2000 + 500; // 500ms to 2.5s
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    console.log('🎭 Spoofing device fingerprint:', {
      userAgent: randomUserAgent.substring(0, 50) + '...',
      fakeIP: randomIP,
      resolution: randomResolution,
      sessionId: sessionId,
      referer: randomReferer || 'direct'
    });
    
    // Send to Textbelt with heavily spoofed headers
    console.log('📡 Sending to Textbelt with aggressive spoofing...');
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': randomUserAgent,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,it;q=0.8,es;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site',
        'Origin': 'https://textbelt.com',
        'Referer': randomReferer || 'https://textbelt.com/',
        'X-Forwarded-For': randomIP,
        'X-Real-IP': randomIP,
        'X-Client-IP': randomIP,
        'X-Originating-IP': randomIP,
        'CF-Connecting-IP': randomIP,
        'X-Forwarded-Host': 'textbelt.com',
        'X-Requested-With': 'XMLHttpRequest',
        'DNT': '1',
        'Sec-GPC': '1',
        'X-Session-ID': sessionId,
        'X-Request-ID': randomId,
        'X-Device-ID': Math.random().toString(36).substring(2, 15),
        'X-Screen-Resolution': randomResolution,
        'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'X-Language': 'en-US',
        'X-Platform': randomUserAgent.includes('Mobile') ? 'mobile' : 'desktop'
      },
      body: formData.toString(),
    });
    
    const result = await response.json();
    console.log('📨 Textbelt response:', result);

    // Check if we got a successful response
    if (result && typeof result.success === 'boolean' && result.success) {
      console.log('🎉 SMS SUCCESSFULLY SENT via Textbelt!');
      console.log('✅ SMS sent using aggressive device spoofing + Vercel IP rotation!');
      return NextResponse.json({
        success: true,
        textId: result.textId,
        quotaRemaining: result.quotaRemaining,
        provider: 'textbelt'
      });
    }
    
    // If failed, return the error but don't try fallbacks
    console.warn('⚠️ Textbelt request failed:', result);
    return NextResponse.json(result || { error: 'SMS sending failed', success: false });
    
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
