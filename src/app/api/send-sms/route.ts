import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 SMS API v4.0 - Clean Implementation');
  
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
    
    // Get user IP for logging
    const userIP = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('cf-connecting-ip') || 
                   request.headers.get('x-real-ip') || 
                   '127.0.0.1';
    
    console.log('🌐 User IP:', userIP);
    
    // Simple Textbelt request
    const formData = new URLSearchParams({
      phone: phone,
      message: message,
      key: 'textbelt'
    });
    
    console.log('📡 Sending to Textbelt...');
    
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      body: formData.toString(),
    });
    
    console.log('📨 Textbelt Response Status:', response.status);
    
    if (!response.ok) {
      console.warn('⚠️ Textbelt HTTP Error:', response.status);
      return NextResponse.json({ 
        error: 'SMS service unavailable',
        status: response.status 
      }, { status: 500 });
    }
    
    const result = await response.json();
    console.log('🎯 Textbelt Result:', result);
    
    if (result && result.success) {
      console.log('✅ SMS sent successfully!');
      return NextResponse.json({
        success: true,
        textId: result.textId,
        quotaRemaining: result.quotaRemaining,
        method: 'textbelt'
      });
    } else {
      console.warn('❌ Textbelt Error:', result?.error);
      return NextResponse.json({ 
        error: result?.error || 'SMS sending failed',
        success: false
      }, { status: 400 });
    }
    
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
