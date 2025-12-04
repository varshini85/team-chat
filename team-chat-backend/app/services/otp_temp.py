from datetime import datetime

def team_chat_otp_email_template(
    otp: str,
    purpose: str = "Password Reset",
    expires_minutes: int = 10,
):
    brand_name = "Team Chat"
    current_year = datetime.now().year

    return f"""<!doctype html>
<html>
<body style="margin:0; padding:0; background:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:24px;">
<table width="600" cellpadding="0" cellspacing="0"
style="background:#ffffff; border-radius:12px; border:1px solid #eaeaea;">

<tr>
<td style="padding:32px 28px; text-align:center;">
<h1 style="margin:0; font-size:26px; color:#111;">
{brand_name}
</h1>
<p style="margin:8px 0 0; font-size:14px; color:#666;">
Secure team communication
</p>
</td>
</tr>

<tr>
<td style="padding:0 28px 12px;">
<h2 style="margin:0; font-size:18px; color:#111;">
{purpose} Verification Code
</h2>
<p style="margin:6px 0 0; font-size:14px; color:#444;">
Enter the code below to continue in Team Chat.
</p>
</td>
</tr>

<tr>
<td align="center" style="padding:12px 28px;">
<div style="
font-size:32px;
font-weight:700;
letter-spacing:4px;
padding:14px 22px;
border:2px dashed #d0d0d0;
border-radius:8px;
background:#fafafa;
display:inline-block;">
{otp}
</div>
</td>
</tr>

<tr>
<td style="padding:0 28px 24px;">
<p style="margin:10px 0 0; font-size:13px; color:#666;">
This code will expire in <strong>{expires_minutes} minutes</strong>.
</p>
<p style="margin:4px 0 0; font-size:12px; color:#888;">
If you didn’t request this, you can safely ignore this email.
</p>
</td>
</tr>

<tr>
<td align="center" style="padding:16px 28px 24px;">
<p style="margin:0; font-size:12px; color:#999;">
© {current_year} Team Chat — All rights reserved
</p>
</td>
</tr>

</table>
</td>
</tr>
</table>
</body>
</html>
"""
