import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();

    // Data validation
    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Phone and message are required' },
        { status: 400 }
      );
    }

    // Using TextBelt API (free service with 1 SMS per day)
    // In production, you could use Twilio, AWS SNS, or other SMS services
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        message: message,
        key: 'textbelt', // Free key with 1 SMS/day limit per IP
      }),
    });

    const data = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        message: 'SMS sent successfully',
        quotaRemaining: data.quotaRemaining
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: data.error || 'Error sending SMS'
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('SMS API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Metodo GET per informazioni sull'API
export async function GET() {
  return NextResponse.json({
    message: 'API SMS Internazionale',
    endpoints: {
      POST: '/api/send-sms - Invia un SMS',
    },
    note: 'Servizio gratuito con limite di 1 SMS al giorno per IP'
  });
}
