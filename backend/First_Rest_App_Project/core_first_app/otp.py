import random
from django.core.mail import send_mail
from django.conf import settings

def generate_otp():
    """Generate a 6-digit OTP."""
    return random.randint(100000, 999999)

def send_otp_email(email, otp):
    """Send OTP to the given email with HTML styling."""
    subject = "Your OTP Code"
    
    # HTML email content
    message = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Your One-Time Password (OTP)</h2>
            <p style="font-size: 18px; font-weight: bold; color: #4CAF50;">{otp}</p>
            <p style="font-size: 14px;">This OTP is valid for 10 minutes. Please use it to complete your registration.</p>
            
            <hr style="border: 1px solid #ccc;">
            
            <p style="font-size: 12px; color: #777;">
                Best regards,<br>
                <strong>WheelTrade</strong><br>
                We specialize in selling high-quality pre-owned cars.<br>
                Visit us at <a href="http://www.wheeltrade.com" style="color: #4CAF50;">www.wheeltrade.com</a><br>
                Follow us on social media for the latest updates.
            </p>
        </body>
    </html>
    """
    
    from_email = settings.EMAIL_HOST_USER
    recipient_list = [email]
    
    # Send the email with the HTML content
    send_mail(
        subject, 
        "",  # Leave the plain text message empty, as we're sending HTML
        from_email, 
        recipient_list, 
        html_message=message  # Include the HTML content
    )
