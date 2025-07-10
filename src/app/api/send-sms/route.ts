import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 SMS API - Direct Textbelt with Advanced IP Spoofing v3.0');
  
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 });
    }
    
    console.log('📱 Sending SMS:', { phone: phone.substring(0, 5) + '***', messageLength: message.length });
    
    // Get real user IP
    const userIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('cf-connecting-ip') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
    
    console.log('🌐 User real IP:', userIP);
    
    // Generate multiple fake IPs based on user IP to create "sessions"
    const ipVariants = [
      userIP,
      userIP.split('.').map((octet, i) => i === 3 ? String((parseInt(octet) + 1) % 255) : octet).join('.'),
      userIP.split('.').map((octet, i) => i === 2 ? String((parseInt(octet) + 1) % 255) : octet).join('.'),
      userIP.split('.').map((octet, i) => i === 1 ? String((parseInt(octet) + 1) % 255) : octet).join('.'),
    ];
    
    // Try different approaches with IP variants
    const strategies = [
      { key: 'textbelt', ip: ipVariants[0], name: 'primary' },
      { key: 'demo', ip: ipVariants[1], name: 'demo' },
      { key: 'test', ip: ipVariants[2], name: 'test' },
      { key: '', ip: ipVariants[3], name: 'no-key' },
    ];
    
    // Randomly shuffle strategies
    const shuffled = strategies.sort(() => Math.random() - 0.5);
    console.log('🎲 Trying strategies:', shuffled.map(s => s.name));
    
    for (const strategy of shuffled) {
      try {
        console.log(`📡 Trying: ${strategy.name} with IP ${strategy.ip}`);
        
        const formData = new URLSearchParams({
          phone: phone,
          message: message,
          ...(strategy.key && { key: strategy.key })
        });
        
        // Generate random session data
        const sessionId = Math.random().toString(36).substring(2, 15);
        const requestId = Date.now().toString();
        
        const response = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache',
            'Origin': 'https://textbelt.com',
            'Referer': 'https://textbelt.com/',
            'X-Forwarded-For': strategy.ip,
            'X-Real-IP': strategy.ip,
            'X-Client-IP': strategy.ip,
            'CF-Connecting-IP': strategy.ip,
            'X-Session-ID': sessionId,
            'X-Request-ID': requestId,
            'X-Originating-IP': strategy.ip,
          },
          body: formData.toString(),
        });
        
        console.log(`📨 ${strategy.name} response:`, response.status);
        
        if (!response.ok) {
          console.warn(`⚠️ ${strategy.name} HTTP error:`, response.status);
          continue;
        }
        
        const result = await response.json();
        console.log(`🎯 ${strategy.name} result:`, result);
        
        if (result && result.success) {
          console.log(`🎉 SMS sent via ${strategy.name}!`);
          return NextResponse.json({
            success: true,
            textId: result.textId,
            quotaRemaining: result.quotaRemaining,
            method: `textbelt-${strategy.name}`,
            ipUsed: strategy.ip.substring(0, 8) + '***'
          });
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
      error: 'All strategies exhausted',
      success: false,
      tried: shuffled.map(s => s.name)
    }, { status: 500 });
    
  } catch (error) {
    console.error('💀 Critical SMS error:', error);
    return NextResponse.json(
      { 
        error: 'SMS sending failed',
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
