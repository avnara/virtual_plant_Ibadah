from rest_framework import serializers
from .models import Achievement, HarvestLog, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'kode', 'nama', 'deskripsi', 'icon']


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'diperoleh_saat']


class HarvestLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = HarvestLog
        fields = ['id', 'tanggal_panen']