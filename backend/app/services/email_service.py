import os
import logging
from typing import Optional
from app.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
    if not settings.BREVO_API_KEY:
        logger.warning("BREVO_API_KEY not configured. Email not sent.")
        return False

    try:
        import requests
        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={
                "api-key": settings.BREVO_API_KEY,
                "Content-Type": "application/json",
            },
            json={
                "sender": {
                    "name": settings.SMTP_FROM_NAME,
                    "email": settings.SMTP_FROM_EMAIL,
                },
                "to": [{"email": to}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content or "",
            },
            timeout=15,
        )
        if response.status_code in (200, 201):
            logger.info(f"Email sent to {to}: {subject}")
            return True
        else:
            logger.error(f"Failed to send email to {to}: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        logger.error(f"Email send error for {to}: {e}")
        return False


def send_verification_email(email: str, name: str, token: str) -> bool:
    client_url = os.getenv("CLIENT_URL", "http://localhost:5500")
    verify_url = f"{client_url}/#verify-email/{token}"

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 20px; }}
.container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }}
.header {{ background: #2D5016; padding: 32px 40px; }}
.header h1 {{ color: #ffffff; margin: 0; font-size: 22px; }}
.header span {{ color: #A7C77A; }}
.body {{ padding: 40px; }}
.body p {{ color: #374151; font-size: 15px; line-height: 1.6; }}
.btn {{ display: inline-block; background: #2D5016; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }}
.footer {{ padding: 24px 40px; background: #f9fafb; border-top: 1px solid #e5e7eb; }}
.footer p {{ color: #9ca3af; font-size: 13px; }}
</style></head><body>
<div class="container">
<div class="header"><h1>Eco<span>Sphere</span></h1></div>
<div class="body">
<p>Hi <strong>{name}</strong>,</p>
<p>Welcome to EcoSphere! Please verify your email address to get started.</p>
<a href="{verify_url}" class="btn">Verify Email Address</a>
<p>This link expires in <strong>24 hours</strong>.</p>
<p style="font-size:13px;color:#6B7280;word-break:break-all;">If the button doesn't work: {verify_url}</p>
</div>
<div class="footer"><p>If you didn't create an EcoSphere account, ignore this email.</p></div>
</div></body></html>"""

    return send_email(
        to=email,
        subject="Verify your EcoSphere account",
        html_content=html,
        text_content=f"Hi {name}, verify your email: {verify_url}",
    )


def send_notification_email(email: str, name: str, title: str, message: str, link: Optional[str] = None) -> bool:
    client_url = os.getenv("CLIENT_URL", "http://localhost:5500")
    link_html = f'<a href="{client_url}/#/{link.lstrip("/")}" class="btn">View Details</a>' if link else ""

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f0; margin: 0; padding: 20px; }}
.container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; }}
.header {{ background: #2D5016; padding: 32px 40px; }}
.header h1 {{ color: #ffffff; margin: 0; font-size: 22px; }}
.header span {{ color: #A7C77A; }}
.body {{ padding: 40px; }}
.body p {{ color: #374151; font-size: 15px; line-height: 1.6; }}
.alert {{ background: #F8F7F4; border-left: 4px solid #2D5016; padding: 16px 20px; border-radius: 0 6px 6px 0; margin: 16px 0; }}
.alert p {{ margin: 0; }}
.btn {{ display: inline-block; background: #2D5016; color: #ffffff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px; margin: 8px 0; }}
.footer {{ padding: 24px 40px; background: #f9f9f7; border-top: 1px solid #e5e7eb; }}
.footer p {{ color: #9ca3af; font-size: 13px; }}
</style></head><body>
<div class="container">
<div class="header"><h1>Eco<span>Sphere</span></h1></div>
<div class="body">
<p>Hi <strong>{name}</strong>,</p>
<div class="alert"><p><strong>{title}</strong></p><p>{message}</p></div>
{link_html}
</div>
<div class="footer"><p>You're receiving this from EcoSphere ESG Platform.</p></div>
</div></body></html>"""

    return send_email(
        to=email,
        subject=f"EcoSphere: {title}",
        html_content=html,
        text_content=f"{title}\n\n{message}",
    )
