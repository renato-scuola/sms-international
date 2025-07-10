import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 SMS API - Using CORS proxy with IP rotation strategy');
  
  try {
    const { phone, message } = await request.json();
    
    if (!phone || !message) {
      return NextResponse.json({ error: 'Phone and message required' }, { status: 400 });
    }
    
    console.log('📱 Sending SMS:', { phone: phone.substring(0, 5) + '***', messageLength: message.length });
    
    // CORS Proxy services with IP rotation
    const corsProxies = [
      'https://corsproxy.io/?',
      'https://cors-anywhere.herokuapp.com/',
      'https://proxy.cors.sh/',
      'https://api.allorigins.win/get?url=',
    ];
    
    // Randomly select a proxy to get different IP
    const randomProxy = corsProxies[Math.floor(Math.random() * corsProxies.length)];
    console.log('🌐 Using CORS proxy:', randomProxy);
    
    // Prepare Textbelt request
    const textbeltUrl = 'https://textbelt.com/text';
    const formData = new URLSearchParams({
      phone: phone,
      message: message,
      key: 'textbelt'
    });
    
    // Make request through rotating IP proxy
    let proxyUrl: string;
    let requestOptions: RequestInit;
    
    if (randomProxy.includes('allorigins')) {
      // Special handling for allorigins
      proxyUrl = `${randomProxy}${encodeURIComponent(textbeltUrl)}`;
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString()
        })
      };
    } else {
      // Standard CORS proxy
      proxyUrl = `${randomProxy}${textbeltUrl}`;
      requestOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: formData.toString()
      };
    }
    
    console.log('📡 Sending through proxy with IP rotation...');
    
    const response = await fetch(proxyUrl, requestOptions);
    
    console.log('📨 Proxy response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }
    
    let result;
    
    if (randomProxy.includes('allorigins')) {
      const proxyResponse = await response.json();
      result = JSON.parse(proxyResponse.contents);
    } else {
      result = await response.json();
    }
    
    console.log('🎯 Textbelt response via proxy:', result);
    
    if (result && result.success) {
      console.log('🎉 SMS sent successfully via IP rotation!');
      return NextResponse.json({
        success: true,
        textId: result.textId,
        quotaRemaining: result.quotaRemaining,
        method: 'cors-proxy-rotation',
        proxy: randomProxy.split('?')[0]
      });
    } else {
      console.warn('⚠️ SMS failed:', result?.error || 'Unknown error');
      return NextResponse.json(result || { error: 'SMS failed', success: false });
    }
    
  } catch (error) {
    console.error('💀 CORS Proxy SMS error:', error);
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
