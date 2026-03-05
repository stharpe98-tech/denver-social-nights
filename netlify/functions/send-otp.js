export default async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  const { email } = await req.json();
  if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

  const RESEND_API_KEY = Netlify.env.get('RESEND_API_KEY');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: 'Denver Social Nights <noreply@denversocialnights.com>',
      to: [email],
      subject: `Your login code: ${otp}`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:40px 24px;">
          <h2 style="font-size:24px;font-weight:900;margin-bottom:8px;">Denver Social Nights</h2>
          <p style="color:#888;margin-bottom:32px;">Here's your one-time login code:</p>
          <div style="background:#F0F6FC;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
            <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#F05A28;">${otp}</div>
          </div>
          <p style="color:#888;font-size:14px;">This code expires in 10 minutes. If you didn't request this, just ignore this email.</p>
        </div>
      `
    })
  });

  if (!res.ok) {
    const err = await res.json();
    return new Response(JSON.stringify({ error: err.message || 'Failed to send email' }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, otp, expires }), { status: 200 });
};

export const config = { path: '/api/send-otp' };
