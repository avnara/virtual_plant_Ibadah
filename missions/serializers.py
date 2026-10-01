from rest_framework import serializers
from .models import PrayerMission, DailyMissionLog


class DailyMissionLogSerializer(serializers.ModelSerializer):
    mission_nama = serializers.CharField(source='mission.get_nama_display', read_only=True)
    mission_id = serializers.IntegerField(source='mission.id', read_only=True)

    class Meta:
        model = DailyMissionLog
        fields = ['id', 'mission_id', 'mission_nama', 'tanggal', 'status', 'alasan', 'poin_didapat']


class AnswerMissionSerializer(serializers.Serializer):
    mission_id = serializers.IntegerField()
    jawaban = serializers.ChoiceField(choices=['ya', 'tidak'])
    alasan = serializers.ChoiceField(choices=['sibuk', 'lupa', 'haid'], required=False, allow_null=True)

    def validate(self, data):
        if data['jawaban'] == 'tidak' and not data.get('alasan'):
            raise serializers.ValidationError({'alasan': 'Alasan wajib diisi jika memilih Tidak.'})
        return data