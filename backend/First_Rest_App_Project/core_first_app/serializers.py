from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Cars, UserProfile  # Combine imports from models


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']  # Include email field

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],  # Save the email
            password=validated_data['password']  # Save the password securely
        )
        return user



class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cars  
        fields = '__all__' 



class UserUpdateSerializer(serializers.ModelSerializer):
    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'profile_picture']

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)

        if 'profile_picture' in validated_data:
            user_profile, _ = UserProfile.objects.get_or_create(user=instance)
            user_profile.profile_picture = validated_data['profile_picture']
            user_profile.save()

        instance.save()
        return instance
