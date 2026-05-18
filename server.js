const express  = require('express');
const cors     = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app    = express();
const resend = new Resend(process.env.RESEND_API_KEY);
const PORT   = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/contact', async (req, res) => {
  const { from_name, from_email, from_phone, service_type, preferred_date, message } = req.body;

  if (!from_name?.trim() || !from_email?.trim() || !service_type) {
    return res.status(400).json({ error: 'Name, email, and service are required.' });
  }

  const sentDate = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const businessMailHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#111;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:20px;">Ehiz Mogaji Electrical</h1>
        <p style="margin:4px 0 0;color:#aaa;font-size:13px;">New Service Request</p>
      </div>
      <div style="border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;padding:32px;">
        <h2 style="margin:0 0 24px;font-size:18px;color:#111;">${service_type}</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 0;color:#888;width:140px;font-size:14px;">Full Name</td>
            <td style="padding:12px 0;font-weight:600;font-size:14px;">${from_name}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 0;color:#888;font-size:14px;">Email</td>
            <td style="padding:12px 0;font-size:14px;">
              <a href="mailto:${from_email}" style="color:#f59e0b;text-decoration:none;">${from_email}</a>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 0;color:#888;font-size:14px;">Phone</td>
            <td style="padding:12px 0;font-size:14px;">${from_phone || 'Not provided'}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 0;color:#888;font-size:14px;">Service</td>
            <td style="padding:12px 0;font-size:14px;">${service_type}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0;">
            <td style="padding:12px 0;color:#888;font-size:14px;">Preferred Date</td>
            <td style="padding:12px 0;font-size:14px;">${preferred_date || 'Not specified'}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;color:#888;font-size:14px;vertical-align:top;">Message</td>
            <td style="padding:12px 0;font-size:14px;line-height:1.6;">
              ${message || '<em style="color:#aaa;">No additional message.</em>'}
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#bbb;">Received on ${sentDate}</p>
      </div>
    </div>
  `;

  const autoReplyHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#111;">
      <div style="background:#111;padding:24px 32px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#fff;font-size:20px;">Ehiz Mogaji Electrical</h1>
      </div>
      <div style="border:1px solid #e5e5e5;border-top:none;border-radius:0 0 8px 8px;padding:32px;">
        <h2 style="margin:0 0 16px;font-size:20px;">Hi ${from_name}, we got your request!</h2>
        <p style="color:#555;line-height:1.6;margin:0 0 16px;">
          Thanks for reaching out. We've received your enquiry for
          <strong>${service_type}</strong> and will get back to you within a few hours.
        </p>
        <div style="background:#f9f9f9;border-radius:8px;padding:16px 24px;margin-bottom:24px;">
          <p style="margin:0;font-size:22px;font-weight:700;">+234 818 890 7896</p>
          <p style="margin:4px 0 0;color:#888;font-size:13px;">Available 24/7 for emergencies</p>
        </div>
        <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;" />
        <p style="margin:0;font-size:12px;color:#bbb;">
          Ehiz Mogaji Electrical · Lagos · Abuja · Port Harcourt & Nationwide<br/>
          RC: 8171988
        </p>
      </div>
    </div>
  `;

  try {
    await resend.emails.send({
      from:    'Ehiz Mogaji Electrical <onboarding@resend.dev>',
      replyTo: from_email,
      to:      process.env.RECIPIENT_EMAIL,
      subject: `New Request from ${from_name} — ${service_type}`,
      html:    businessMailHtml,
    });

    await resend.emails.send({
      from:    'Ehiz Mogaji Electrical <onboarding@resend.dev>',
      to:      from_email,
      subject: 'We received your request — Ehiz Mogaji Electrical',
      html:    autoReplyHtml,
    });

    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (err) {
    console.error('Resend error:', err.message);
    return res.status(500).json({ error: 'Failed to send email. Please try again later.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});