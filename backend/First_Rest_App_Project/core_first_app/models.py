from django.db import models
from django.contrib.auth.models import User


class Cars(models.Model):
    car_name = models.CharField(max_length=122)
    car_company = models.CharField(max_length=122)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    manufacture_year = models.IntegerField()
    is_available = models.BooleanField(default=True)
    car_image = models.ImageField(upload_to='cars_images/', null=True, blank=True)  # Saves to /media/cars_images
    
    # New fields
    registration_number = models.CharField(max_length=15, unique=True, null=True, blank=True)  # Format: MH-12-XX-1234
    chassis_number = models.CharField(max_length=17, unique=True, null=True, blank=True)  # Unique VIN
    engine_number = models.CharField(max_length=17, unique=True, null=True, blank=True)  # Unique Engine ID

    def __str__(self):
        return f"{self.car_name} - {self.car_company}"


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)  # Saves to /media/profile_pics

    def __str__(self):
        return self.user.username
