from django.http import HttpResponse
from .models import Cars
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from datetime import datetime
import random
import string

def generate_unique_number():
    """Generate a unique order number (e.g., '27B00032991LQ354')."""
    random_number = ''.join(random.choices(string.ascii_uppercase + string.digits, k=13))
    return random_number


def generate_registration_number():
    """Generate a unique registration number (e.g., 'MH-12-AB-3456')."""
    return f"MH-{random.randint(10, 99)}-{random.choice(string.ascii_uppercase)}{random.choice(string.ascii_uppercase)}-{random.randint(1000, 9999)}"


def generate_chassis_number():
    """Generate a unique chassis number (e.g., 'CH1234567890')."""
    return f"CH{random.randint(1000000000, 9999999999)}"

def generate_paytm_number():
    return f"PMO{random.randint(1000000, 9999999)}"


def generate_engine_number():
    """Generate a unique engine number (e.g., 'EN1234567890')."""
    return f"EN{random.randint(1000000000, 9999999999)}"


def generate_pdf(request, car_id):
    car = Cars.objects.get(id=car_id)  # Get the car details from the database
    current_date = datetime.now().strftime('%d-%m-%Y')
    
    order_number = generate_unique_number()
    registration_number = generate_registration_number()
    chassis_number = generate_chassis_number()
    engine_number = generate_engine_number()
    
    base_price = car.price  # Assuming price field is present in the car model
    gst = base_price * 0.18  # GST 18%
    on_road_price = base_price + gst

    # Create HTTP response with PDF content
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="car_invoice_{order_number}.pdf"'

    # Create a PDF canvas using ReportLab
    p = canvas.Canvas(response, pagesize=letter)
    
    # Set up some basic formatting
    p.setFont("Helvetica", 10)
    
    # Add content to the PDF
    p.drawString(100, 750, f"Tax invoice/Bill of Supply/Cash memo")
    p.drawString(100, 730, f"Number: {order_number}  Date: {current_date}")
    p.drawString(100, 710, f"PaytmMall Order Id: {random.randint(1000000000, 9999999999)}")
    
    # Seller Details
    p.drawString(100, 670, "Seller Details:")
    p.drawString(100, 655, "WheelTrade Pvt. Ltd.")
    p.drawString(100, 640, "123 Main Street, Auto Lane")
    p.drawString(100, 625, "Mumbai, Maharashtra - 400001")
    p.drawString(100, 610, "Phone: +91-9876543210")
    p.drawString(100, 595, "Email: sales@WheelTrade.com")
    p.drawString(100, 580, "GSTIN: 27ABCDE1234F1ZK")
    
    # Shipping and Buyer Details
    p.drawString(100, 550, f"Shipping Address: xxxxxxxx")
    p.drawString(100, 535, f"Phone: +xxxx-xxx-xxx-xxxx")
    p.drawString(100, 520, f"Email: xxx@xxxxx.com")
    
    p.drawString(100, 500, f"Buyer Details:")
    p.drawString(100, 485, f"{car.owner_name}")
    p.drawString(100, 470, f"{car.owner_address}")
    
    # Car Details
    p.drawString(100, 440, f"Car Details:")
    p.drawString(100, 425, f"Make and Model: {car.car_name}")
    p.drawString(100, 410, f"Company Name: {car.car_company}")
    p.drawString(100, 395, f"Registration Year: {car.manufacture_year}")
    p.drawString(100, 380, f"Registration Number: {registration_number}")
    p.drawString(100, 365, f"Chassis Number: {chassis_number}")
    p.drawString(100, 350, f"Engine Number: {engine_number}")
    
    # Pricing Details
    p.drawString(100, 320, f"Pricing Details:")
    p.drawString(100, 305, f"Base Price (INR): {base_price}")
    p.drawString(100, 290, f"GST (18%): {gst}")
    p.drawString(100, 275, f"On-Road Price (INR): {on_road_price}")
    
    # Total Amount in Words
    p.drawString(100, 245, f"Total Amount in Words: Seventeen Lakh Seventy Thousand Rupees Only")
    
    # Declaration
    p.drawString(100, 215, f"Declaration: We declare that this invoice shows the actual price of the goods described above.")
    
    # Signature
    p.drawString(100, 180, f"Authorized Signature: ____________________________")

    # Finalize the PDF
    p.showPage()
    p.save()

    return response
