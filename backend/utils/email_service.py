"""
Email service for sending emails
"""
import os
import logging
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

logger = logging.getLogger(__name__)

def generate_otp(length=6):
    """Generate a random OTP of specified length"""
    return ''.join(random.choices(string.digits, k=length))

def send_email(to_email, subject, html_content, text_content=None):
    """
    Send an email using SMTP

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content of the email (optional)

    Returns:
        True if email was sent successfully, False otherwise
    """
    # Check if we're in development mode
    if current_app.config.get('FLASK_ENV') == 'development' and current_app.config.get('USE_MOCK_EMAIL', True):
        # In development mode, just log the email instead of sending it
        logger.info(f"[MOCK EMAIL] To: {to_email}, Subject: {subject}")
        logger.info(f"[MOCK EMAIL] Text Content: {text_content[:100]}...")
        logger.info(f"[MOCK EMAIL] Would have sent email to {to_email}")
        return True

    try:
        # Get email configuration from app config
        smtp_server = current_app.config.get('SMTP_SERVER')
        smtp_port = current_app.config.get('SMTP_PORT')
        smtp_username = current_app.config.get('SMTP_USERNAME')
        smtp_password = current_app.config.get('SMTP_PASSWORD')
        from_email = current_app.config.get('EMAIL_FROM')

        # Check if email configuration is available
        if not all([smtp_server, smtp_port, smtp_username, smtp_password, from_email]):
            logger.warning("Email configuration not complete. Check environment variables.")
            return False

        # Create message
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_email
        msg['To'] = to_email

        # Add text content if provided
        if text_content:
            msg.attach(MIMEText(text_content, 'plain'))

        # Add HTML content
        msg.attach(MIMEText(html_content, 'html'))

        # Connect to SMTP server and send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)

        logger.info(f"Email sent successfully to {to_email}")
        return True

    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def send_password_reset_email(to_email, otp, reset_token):
    """
    Send password reset email with OTP

    Args:
        to_email: Recipient email address
        otp: One-time password for verification
        reset_token: Password reset token

    Returns:
        True if email was sent successfully, False otherwise
    """
    subject = "SentimentSage Password Reset"

    # HTML content
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background-color: #1a365d; color: white; padding: 10px 20px; text-align: center; }}
            .content {{ padding: 20px; background-color: #f9f9f9; }}
            .otp {{ font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0; letter-spacing: 5px; color: #1a365d; }}
            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>SentimentSage Password Reset</h2>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your SentimentSage account. Please use the following One-Time Password (OTP) to verify your identity:</p>
                <div class="otp">{otp}</div>
                <p>This OTP will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
                <p>Thank you,<br>The SentimentSage Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Plain text content
    text_content = f"""
    SentimentSage Password Reset

    Hello,

    We received a request to reset your password for your SentimentSage account. Please use the following One-Time Password (OTP) to verify your identity:

    {otp}

    This OTP will expire in 15 minutes. If you did not request a password reset, please ignore this email or contact support if you have concerns.

    Thank you,
    The SentimentSage Team

    This is an automated message, please do not reply to this email.
    """

    return send_email(to_email, subject, html_content, text_content)
