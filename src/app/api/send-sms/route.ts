import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 SMS API v5.0 - Textbelt Hybrid Strategy');
  
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      console.log('❌ Missing phone or message');
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 });
    }
    
    console.log('📱 SMS Request:', { 
      phone: phone.substring(0, 6) + '***', 
      messageLength: message.length 
    });

    // Get user IP for spoofing
    const userIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('cf-connecting-ip') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
    
    console.log('🌐 User IP:', userIP);
    
    // Generate fake IPs based on user IP
    const generateVariantIP = (baseIP: string, variant: number): string => {
      const parts = baseIP.split('.');
      if (parts.length === 4) {
        // Vary last octet
        parts[3] = String((parseInt(parts[3]) + variant) % 255);
        return parts.join('.');
      }
      return baseIP;
    };
    
    // Strategy 1: Multiple Textbelt keys + IP variants
    const strategies = [
      { 
        key: 'textbelt', 
        ip: userIP,
        name: 'primary-real-ip' 
      },
      { 
        key: '', 
        ip: generateVariantIP(userIP, 1),
        name: 'no-key-variant-ip1' 
      },
      { 
        key: 'demo', 
        ip: generateVariantIP(userIP, 2),
        name: 'demo-variant-ip2' 
      },
      { 
        key: 'test', 
        ip: generateVariantIP(userIP, 3),
        name: 'test-variant-ip3' 
      },
      { 
        key: 'free', 
        ip: generateVariantIP(userIP, 4),
        name: 'free-variant-ip4' 
      }
    ];
    
    // Strategy 2: First check quota
    try {
      console.log('📊 Checking Textbelt quota...');
      const quotaResponse = await fetch('https://textbelt.com/quota/textbelt');
      if (quotaResponse.ok) {
        const quotaData = await quotaResponse.json();
        console.log('📊 Quota remaining:', quotaData.quotaRemaining);
        
        if (quotaData.quotaRemaining === 0) {
          console.log('⚠️ Main quota exhausted, using alternative strategies');
        }
      }
    } catch {
      console.log('⚠️ Could not check quota, proceeding with strategies');
    }
    
    // Strategy 3: Try each approach in sequence
    for (const strategy of strategies) {
      try {
        console.log(`📡 Trying: ${strategy.name} with IP ${strategy.ip}`);
        
        const formData = new URLSearchParams({
          phone: phone,
          message: message,
          ...(strategy.key && { key: strategy.key })
        });
        
        // Generate session headers for anti-detection
        const sessionId = Math.random().toString(36).substring(2, 15);
        const timestamp = Date.now().toString();
        
        const response = await fetch('https://textbelt.com/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 20) + 100}.0.0.0 Safari/537.36`,
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9,it;q=0.8',
            'Cache-Control': 'no-cache',
            'Origin': 'https://textbelt.com',
            'Referer': 'https://textbelt.com/',
            'X-Forwarded-For': strategy.ip,
            'X-Real-IP': strategy.ip,
            'X-Client-IP': strategy.ip,
            'CF-Connecting-IP': strategy.ip,
            'X-Session-ID': sessionId,
            'X-Request-ID': timestamp,
            'X-Forwarded-Proto': 'https',
            'X-Originating-IP': strategy.ip,
          },
          body: formData.toString(),
        });
        
        console.log(`📨 ${strategy.name} Response:`, response.status);
        
        if (!response.ok) {
          console.warn(`⚠️ ${strategy.name} HTTP error:`, response.status);
          continue;
        }
        
        const result = await response.json();
        console.log(`🎯 ${strategy.name} Result:`, result);
        
        if (result && result.success) {
          console.log(`✅ SMS sent via ${strategy.name}!`);
          
          // Strategy 4: Track delivery status if textId provided
          if (result.textId) {
            setTimeout(async () => {
              try {
                const statusResponse = await fetch(`https://textbelt.com/status/${result.textId}`);
                if (statusResponse.ok) {
                  const statusData = await statusResponse.json();
                  console.log(`📊 SMS ${result.textId} status:`, statusData.status);
                }
              } catch {
                console.log('⚠️ Could not check delivery status');
              }
            }, 5000);
          }
          
          return NextResponse.json({
            success: true,
            textId: result.textId,
            quotaRemaining: result.quotaRemaining,
            method: `textbelt-${strategy.name}`,
            strategy: strategy.key || 'no-key',
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
      error: 'All Textbelt strategies exhausted',
      success: false,
      tried: strategies.map(s => s.name),
      suggestion: 'Try again later or consider getting a paid Textbelt API key'
    }, { status: 500 });
    
  } catch (error) {
    console.error('💀 API Error:', error);
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
