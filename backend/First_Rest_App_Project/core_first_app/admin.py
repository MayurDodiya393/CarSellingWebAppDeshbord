from django.contrib import admin
from .models import Cars

# Register your models here.
class CarsAdmin(admin.ModelAdmin):
    list_display = ('car_name', 'car_company', 'price', 'manufacture_year', 'is_available')
    search_fields = ('car_name', 'car_company')
    list_filter = ('is_available', 'manufacture_year')
    ordering = ('car_name',)

admin.site.register(Cars, CarsAdmin)
