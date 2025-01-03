from django.urls import path
from .views import CarsAPI, RegisterUser, OTPView, search_car, CustomTokenObtainPairView, UserProfileView, PDFInvoiceView, api_routes_view
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', api_routes_view, name='api_routes'),  # New route
    path('api/register/', RegisterUser.as_view(), name='register_user'),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/cars/', CarsAPI.as_view(), name='cars_list_create'),
    path('api/cars/<int:pk>/', CarsAPI.as_view(), name='cars_detail_update_delete'),
    path('api/searchProduct/', search_car, name='search_product'), 
    path('api/send-otp/', OTPView.as_view(), name='send_otp'),
    path('api/verify-otp/', OTPView.as_view(), name='verify_otp'),
    path('api/user/profile/', UserProfileView.as_view(), name='user_profile'),
    path('generate_invoice/<int:car_id>/', PDFInvoiceView.as_view(), name='generate_invoice'),
]
