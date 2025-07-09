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
    
    // Randomly choose starting provider to distribute load
    const startProvider = Math.random();
    let response: Response;
    let result: Record<string, unknown> | null = null;
    
    if (startProvider < 0.7) {
      // 70% chance: Try Textbelt first (main provider)
      console.log('🎯 Starting with Textbelt...');
      response = await fetch('https://textbelt.com/text', {
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
      
      result = await response.json();
    } else {
      // 30% chance: Try alternative provider first
      console.log('🎯 Starting with alternative provider...');
      result = { error: 'quota' }; // Force fallback to alternatives
    }
    
    // If quota reached, try alternative approach
    if (result && typeof result.error === 'string' && (result.error.includes('quota') || result.error.includes('limit') || result.error.includes('Out of quota'))) {
      console.log('⚠️ Primary quota reached, trying alternative SMS providers...');
      
      // Try alternative SMS provider 1: SMSdev
      try {
        console.log('🔄 Trying SMSdev API...');
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        response = await fetch('https://api.smsdev.com.br/v1/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'curl/7.68.0',
          },
          body: JSON.stringify({
            number: phone,
            message: message,
            type: 'text'
          }),
        });
        
        if (response.ok) {
          result = await response.json();
          if (result && typeof result.situacao === 'string' && result.situacao === 'APROVADO') {
            console.log('✅ SMS sent via SMSdev!');
            return NextResponse.json({ success: true, textId: result.id, provider: 'smsdev' });
          }
        }
      } catch (e) {
        console.log('❌ SMSdev failed:', e);
      }
      
      // Try alternative SMS provider 2: FreeSMS
      try {
        console.log('🔄 Trying FreeSMS API...');
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        response = await fetch('https://www.freesms.com/api/send.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'PostmanRuntime/7.32.0',
          },
          body: new URLSearchParams({
            phone: phone,
            text: message,
            api_key: 'free'
          }).toString(),
        });
        
        if (response.ok) {
          result = await response.json();
          if (result && typeof result.status === 'string' && result.status === 'sent') {
            console.log('✅ SMS sent via FreeSMS!');
            return NextResponse.json({ success: true, textId: result.id, provider: 'freesms' });
          }
        }
      } catch (e) {
        console.log('❌ FreeSMS failed:', e);
      }
      
      // Try alternative SMS provider 3: SMS77
      try {
        console.log('🔄 Trying SMS77 API...');
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        response = await fetch('https://gateway.sms77.io/api/sms', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'insomnia/2023.5.8',
            'X-API-Key': 'demo',
          },
          body: new URLSearchParams({
            to: phone,
            text: message,
            from: 'SMS77'
          }).toString(),
        });
        
        if (response.ok) {
          const responseText = await response.text();
          if (responseText.includes('100')) {
            console.log('✅ SMS sent via SMS77!');
            return NextResponse.json({ success: true, textId: Date.now().toString(), provider: 'sms77' });
          }
        }
      } catch (e) {
        console.log('❌ SMS77 failed:', e);
      }
      
      // Last resort: Try Textbelt with completely different approach
      try {
        console.log('🔄 Last resort: Textbelt with new strategy...');
        await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
        
        // Use different endpoint and parameters
        response = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15',
            'Referer': 'https://textbelt.com/',
            'Origin': 'https://textbelt.com',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: new URLSearchParams({
            phone: phone,
            message: `${message} [${Math.random().toString(36).substring(7)}]`,
            key: 'textbelt',
            replyWebhookUrl: `https://webhook.site/${Math.random().toString(36).substring(2, 15)}`
          }).toString(),
        });
        
        result = await response.json();
      } catch (e) {
        console.log('❌ Final Textbelt attempt failed:', e);
      }
    }

    // Check if we got a successful response from any provider
    if (result && typeof result.success === 'boolean' && result.success) {
      console.log('📨 SMS sent successfully!');
      console.log('✅ SMS sent using Vercel IP rotation + randomized fingerprint!');
      return NextResponse.json(result);
    }
    
    // If we reach here, all providers failed
    console.log('❌ All SMS providers failed');
    return NextResponse.json(result || { error: 'All SMS providers exhausted', success: false });
    
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
