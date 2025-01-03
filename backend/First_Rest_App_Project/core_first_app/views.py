from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status,permissions
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

from django.core.cache import cache 
from django.contrib.auth.models import User
from django.http import JsonResponse

from .models import Cars, UserProfile 
from .serializers import CarSerializer, UserSerializer, UserUpdateSerializer
from .otp import generate_otp, send_otp_email


class UserProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            user_profile = UserProfile.objects.get(user=user)
            profile_picture = user_profile.profile_picture.url if user_profile.profile_picture else None
            return Response({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile_picture': profile_picture,
            })
        except UserProfile.DoesNotExist:
            return Response({
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile_picture': None,
            })

    def patch(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class OTPView(APIView):
    def post(self, request, *args, **kwargs):
        # Get email from request data (JSON body)
        email = request.data.get('email')
        otp = request.query_params.get('otp')
        
        if not email:
            return JsonResponse({"error": "Email is required"}, status=400)

        if 'send-otp' in request.path:
            # Generate OTP and send to email
            otp = generate_otp()
            cache.set(f"otp_{email}", otp, timeout=600)  # OTP expires in 10 minutes
            send_otp_email(email, otp)  # Send OTP to the provided email
            return JsonResponse({"message": f"OTP sent to {email}"})

        elif 'verify-otp' in request.path:
            # Verify OTP
            otp = request.data.get('otp')
            cached_otp = cache.get(f"otp_{email}")
            if str(cached_otp) == str(otp):
                cache.delete(f"otp_{email}")  # Clear the OTP after successful verification
                return JsonResponse({"message": "OTP verified successfully"})
            return JsonResponse({"error": "Invalid or expired OTP."}, status=400)

        return JsonResponse({"error": "Invalid request"}, status=400)



class RegisterUser(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        username = request.data.get('username')
        password = request.data.get('password')

        if not email or not otp or not username or not password:
            return Response({"error": "Email, OTP, Username, and Password are required"}, status=status.HTTP_400_BAD_REQUEST)

        # Verify OTP
        cached_otp = cache.get(f"otp_{email}")
        if not cached_otp:
            return Response({"error": "OTP has expired or is invalid"}, status=status.HTTP_400_BAD_REQUEST)

        if str(cached_otp) != str(otp):
            return Response({"error": "Invalid OTP"}, status=status.HTTP_400_BAD_REQUEST)

        # If OTP is valid, delete it from cache
        cache.delete(f"otp_{email}")

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({"error": "User with this email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        # Create the user
        user = User.objects.create_user(username=username, email=email, password=password)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        # Send response with tokens
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(access_token),
        }, status=status.HTTP_201_CREATED)



class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            raise AuthenticationFailed('Email and password are required')

        try:
            user = User.objects.get(email=email)
            if not user.check_password(password):
                raise AuthenticationFailed('Invalid credentials')
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')

        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token

        return Response({
            'access': str(access_token),
            'refresh': str(refresh),
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_200_OK)



class CarsAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, pk=None):
        if pk:
            try:
                car = Cars.objects.get(pk=pk)
                serializer = CarSerializer(car)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except Cars.DoesNotExist:
                return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)
        cars = Cars.objects.all()
        serializer = CarSerializer(cars, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        car_image = request.FILES.get('car_image')
        car_data = request.data
        if car_image:
            car_data['car_image'] = car_image


        # Validation for unique fields
        if Cars.objects.filter(registration_number=car_data.get('registration_number')).exists():
            return Response({'error': 'Registration number already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if Cars.objects.filter(chassis_number=car_data.get('chassis_number')).exists():
            return Response({'error': 'Chassis number already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if Cars.objects.filter(engine_number=car_data.get('engine_number')).exists():
            return Response({'error': 'Engine number already exists'}, status=status.HTTP_400_BAD_REQUEST)


        serializer = CarSerializer(data=car_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        try:
            car_obj = Cars.objects.get(pk=pk)
            serializer = CarSerializer(car_obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Cars.DoesNotExist:
            return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request, pk):
        try:
            car = Cars.objects.get(pk=pk)
            car.delete()
            return Response({'message': 'Car deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Cars.DoesNotExist:
            return Response({'error': 'Car not found'}, status=status.HTTP_404_NOT_FOUND)



@api_view(['GET'])
def search_car(request):
    query = request.GET.get('query', '')
    if query:
        cars = Cars.objects.filter(car_name__icontains=query)
        serializer = CarSerializer(cars, many=True)
        return Response(serializer.data)
    return Response({"message": "No search query provided."}, status=status.HTTP_400_BAD_REQUEST)



from django.shortcuts import render

def api_routes_view(request):
    return render(request, 'api_views.html')



from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.timezone import localtime
from decimal import Decimal
from xhtml2pdf import pisa
from io import BytesIO
from num2words import num2words  # Import the library
from .models import Cars
from .pdf_maker import generate_unique_number, generate_paytm_number
import logging

logger = logging.getLogger(__name__)

class PDFInvoiceView(APIView):
    def get(self, request, *args, **kwargs):
        car_id = kwargs.get('car_id')
        try:
            car = Cars.objects.get(pk=car_id)
        except Cars.DoesNotExist:
            return HttpResponse('Car not found', status=404)

        try:
            base_price = Decimal(car.price)
        except (ValueError, TypeError):
            return HttpResponse('Invalid car price format.', status=400)

        order_number = generate_unique_number()
        order_id = generate_paytm_number()

        order_id = str(order_id)

        gst = base_price * Decimal('0.18')
        on_road_price = base_price + gst

        # Convert on_road_price to words
        on_road_price_in_words = num2words(on_road_price, to='currency', lang='en_IN').replace("-", " ").replace(",", "")  # Converts number to words

        context = {
            'order_number': order_number,
            'current_date': localtime().strftime("%Y-%m-%d %H:%M:%S"),
            'order_id': order_id,
            'car_name': car.car_name,
            'car_company': car.car_company,
            'manufacture_year': car.manufacture_year,
            'registration_number': car.registration_number,
            'chassis_number': car.chassis_number,
            'engine_number': car.engine_number,
            'base_price': base_price,
            'gst': gst,
            'on_road_price': on_road_price,
            'on_road_price_in_words': on_road_price_in_words  # Pass the price in words to the template
        }

        html_content = render_to_string('pdf.html', context)

        # Set the filename of the PDF to include the order_id
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="Invoice - {order_id}.pdf"'

        buffer = BytesIO()
        try:
            pisa_status = pisa.CreatePDF(html_content, dest=buffer)
            if pisa_status.err:
                logger.error('Error generating PDF', exc_info=True)
                return HttpResponse('We had some errors while generating the PDF document.')
            buffer.seek(0)
            response.write(buffer.read())
        finally:
            buffer.close()

        return response
