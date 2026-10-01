from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'display_name', 'gender', 'provinsi', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            display_name=validated_data.get('display_name', ''),
            gender=validated_data.get('gender', ''),
            provinsi=validated_data.get('provinsi', ''),
        )
        user.set_password(validated_data['password'])  # otomatis di-hash, aman
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'display_name', 'gender', 'provinsi', 'foto_profil', 'email', 'latitude', 'longitude', 'timezone']
class UpdateLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['latitude', 'longitude', 'timezone']
class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['display_name', 'gender', 'provinsi', 'foto_profil']