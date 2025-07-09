import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 API Route called - Starting SMS process...');
  
  try {
    console.log('📝 Parsing request body...');
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      console.error('❌ Missing phone or message');
      return NextResponse.json({ error: 'Phone and message are required' }, { status: 400 });
    }
    
    console.log('✅ Request validated:', { phone: phone.substring(0, 5) + '***', messageLength: message.length });

    console.log('🚀 Sending SMS from Vercel serverless function...');
    console.log('📍 Vercel Region:', process.env.VERCEL_REGION || 'development');
    
    // Get user's real IP address from various headers
    const userIP = 
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-client-ip') ||
      request.headers.get('x-forwarded') ||
      request.headers.get('forwarded-for') ||
      request.headers.get('forwarded') ||
      '127.0.0.1'; // fallback
    
    console.log('🌐 User real IP detected:', userIP);
    console.log('📊 All request headers for IP detection:', {
      'x-forwarded-for': request.headers.get('x-forwarded-for'),
      'x-real-ip': request.headers.get('x-real-ip'),
      'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
      'x-client-ip': request.headers.get('x-client-ip')
    });
    
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
    
    // Use user's real IP for spoofing (more effective than random IPs)
    console.log('🎯 Using user real IP for spoofing:', userIP);
    
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
    
    // Strategy 1: Try multiple free SMS services and Textbelt variants to bypass limits
    const apiStrategies = [
      // Multiple Textbelt keys (some may work when others are blocked)
      { 
        url: 'https://textbelt.com/text',
        key: 'textbelt',
        name: 'textbelt-official',
        type: 'textbelt'
      },
      { 
        url: 'https://textbelt.com/text',
        key: 'demo',
        name: 'textbelt-demo',
        type: 'textbelt'
      },
      // Try alternative free keys that might work
      { 
        url: 'https://textbelt.com/text',
        key: 'free',
        name: 'textbelt-free-alt',
        type: 'textbelt'
      },
      { 
        url: 'https://textbelt.com/text',
        key: 'test',
        name: 'textbelt-test',
        type: 'textbelt'
      },
      // FreeSMS API (completely free alternative)
      {
        url: 'https://freesms.eu.org/api/send',
        key: '',
        name: 'freesms-eu',
        type: 'freesms'
      },
      // SMS77 demo (sometimes works without key)
      {
        url: 'https://gateway.sms77.io/api/sms',
        key: 'demo',
        name: 'sms77-demo',
        type: 'sms77'
      },
      // SMSApi free tier
      {
        url: 'https://api.smsapi.com/sms.do',
        key: 'demo',
        name: 'smsapi-demo',
        type: 'smsapi'
      }
    ];
    
    // Randomly select starting strategy
    const shuffledStrategies = [...apiStrategies].sort(() => Math.random() - 0.5);
    console.log('🎲 Trying API strategies in random order:', shuffledStrategies.map(s => s.name));
    
    // Add random delay to avoid rate limiting patterns (vary timing)
    const randomDelay = Math.random() * 2000 + 500; // 500ms to 2.5s
    await new Promise(resolve => setTimeout(resolve, randomDelay));
    
    console.log('🎭 Spoofing device fingerprint:', {
      userAgent: randomUserAgent.substring(0, 50) + '...',
      realUserIP: userIP,
      resolution: randomResolution,
      sessionId: sessionId,
      referer: randomReferer || 'direct'
    });
      // Try each strategy until one works
    let result: Record<string, unknown> | null = null;
    let lastError = '';

    for (const strategy of shuffledStrategies) {
      try {
        console.log(`📡 Trying strategy: ${strategy.name} (${strategy.type}) with ${strategy.key ? 'key: ' + strategy.key : 'no key'}`);
        
        let formData: URLSearchParams;
        let headers: Record<string, string>;
        
        // Configure request based on API type
        switch (strategy.type) {
          case 'textbelt':
            formData = new URLSearchParams({
              phone: phone,
              message: message,
              ...(strategy.key && { key: strategy.key })
            });
            headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': randomUserAgent,
              'Accept': 'application/json, text/plain, */*',
              'Accept-Language': 'en-US,en;q=0.9,it;q=0.8,es;q=0.7',
              'Cache-Control': 'no-cache',
              'Origin': 'https://textbelt.com',
              'Referer': randomReferer || 'https://textbelt.com/',
              'X-Forwarded-For': userIP,
              'X-Real-IP': userIP,
              'X-Session-ID': sessionId,
              'X-Request-ID': randomId,
            };
            break;
            
          case 'freesms':
            formData = new URLSearchParams({
              to: phone,
              text: message,
              from: 'SMS-Online'
            });
            headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': randomUserAgent,
              'Accept': 'application/json',
              'X-Forwarded-For': userIP,
              'X-Real-IP': userIP
            };
            break;
            
          case 'sms77':
            formData = new URLSearchParams({
              to: phone,
              text: message,
              from: 'SMS-Online',
              ...(strategy.key && { p: strategy.key })
            });
            headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': randomUserAgent,
              'Accept': 'application/json',
              'X-Forwarded-For': userIP
            };
            break;
            
          case 'smsapi':
            formData = new URLSearchParams({
              to: phone,
              message: message,
              from: 'SMS-Online',
              format: 'json',
              ...(strategy.key && { username: strategy.key, password: strategy.key })
            });
            headers = {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': randomUserAgent,
              'Accept': 'application/json',
              'X-Forwarded-For': userIP
            };
            break;
            
          default:
            throw new Error(`Unknown API type: ${strategy.type}`);
        }

        const response = await fetch(strategy.url, {
          method: 'POST',
          headers,
          body: formData.toString(),
        });
        
        console.log(`📡 ${strategy.name} response status:`, response.status, response.statusText);
        
        if (!response.ok) {
          console.warn(`⚠️ ${strategy.name} HTTP error:`, response.status);
          const errorText = await response.text();
          console.warn(`💥 ${strategy.name} error response:`, errorText);
          lastError = `${strategy.name}: HTTP ${response.status}`;
          continue; // Try next strategy
        }
        
        result = await response.json();
        console.log(`📨 ${strategy.name} response:`, result);
        
        // Check if successful based on API type
        let isSuccess = false;
        
        if (result) {
          switch (strategy.type) {
            case 'textbelt':
              isSuccess = typeof result.success === 'boolean' && result.success;
              break;
            case 'freesms':
              isSuccess = result.status === 'sent' || result.success === true;
              break;
            case 'sms77':
              isSuccess = result.success === '100' || result.success === true || result.status === 'sent';
              break;
            case 'smsapi':
              isSuccess = result.error === null || result.success === true || result.status === 'sent';
              break;
            default:
              isSuccess = result.success === true || result.status === 'sent';
          }
        }
        
        if (isSuccess && result) {
          console.log(`🎉 SMS SUCCESSFULLY SENT via ${strategy.name}!`);
          console.log('✅ SMS sent using real user IP + multi-provider strategy!');
          return NextResponse.json({
            success: true,
            textId: result.textId || result.id || 'N/A',
            quotaRemaining: result.quotaRemaining || result.remaining || 'N/A',
            provider: strategy.name,
            strategy: strategy.name
          });
        }
        
        // If not successful but no error, log and try next
        if (result && result.error) {
          console.warn(`⚠️ ${strategy.name} failed:`, result.error);
          lastError = `${strategy.name}: ${result.error}`;
          
          // If quota error, definitely try next strategy
          if (result.error.toString().includes('quota') || 
              result.error.toString().includes('limit') ||
              result.error.toString().includes('Out of quota')) {
            console.warn(`📊 ${strategy.name} quota exhausted, trying next strategy...`);
            continue;
          }
        }
        
      } catch (fetchError) {
        console.error(`💀 ${strategy.name} fetch error:`, fetchError);
        lastError = `${strategy.name}: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`;
        continue; // Try next strategy
      }
    }
    
    // If we get here, all strategies failed
    console.error('❌ All API strategies exhausted');
    return NextResponse.json({ 
      error: 'All SMS strategies failed', 
      details: lastError,
      success: false 
    }, { status: 500 });
    
  } catch (error) {
    console.error('💀 CRITICAL ERROR in API route:', error);
    console.error('🔍 Error type:', typeof error);
    console.error('🔍 Error constructor:', error?.constructor?.name);
    console.error('🔍 Error message:', error instanceof Error ? error.message : 'Non-Error object');
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        error: 'Failed to send SMS',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error?.constructor?.name || 'Unknown'
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
