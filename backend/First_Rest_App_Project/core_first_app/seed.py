import os
import django
import requests
from faker import Faker
from core_first_app.models import Cars 
from django.core.files.base import ContentFile
from io import BytesIO
import random

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'First_Rest_App_Project.settings')
django.setup()

# Create a Faker instance
fake = Faker()

# Path to store images locally in 'static/pdfs/cars_images'
CARS_IMAGES_PATH = "public/static/pdfs/cars_images/"

def create_fake_car():
    """Create a fake car instance with a fake image stored locally."""
    # Generate a fake car instance
    car_name = fake.company()
    car_company = fake.company_suffix()
    price = fake.random_number(digits=5)
    manufacture_year = fake.year()
    is_available = fake.boolean()

    # Generate a fake image URL
    image_url = fake.image_url(width=800, height=600)
    image_name = f"{car_name.replace(' ', '_')}_{random.randint(1000, 9999)}.jpg"  # Unique image name

    # Download the image from the URL
    response = requests.get(image_url)
    if response.status_code == 200:
        # Save image locally in the specified directory
        image_path = os.path.join(CARS_IMAGES_PATH, image_name)

        with open(image_path, 'wb') as f:
            f.write(response.content)

        # Now save the car model with the image path
        car = Cars(
            car_name=car_name,
            car_company=car_company,
            price=price,
            manufacture_year=manufacture_year,
            is_available=is_available,
            car_image=os.path.join('static/pdfs/cars_images', image_name)  # Save the relative path in the DB
        )
        car.save()
        print(f"Created car: {car}")
    else:
        print(f"Failed to download image for car {image_name}")

def seed_cars(num=10):
    """Generate fake car data."""
    for _ in range(num):
        create_fake_car()

# Run the seeding process (you can change the number of cars you want to generate)
if __name__ == "__main__":
    print("Seeding cars data...")
    seed_cars(20)  # Creates 20 fake cars with images
    print("Seeding complete!")
