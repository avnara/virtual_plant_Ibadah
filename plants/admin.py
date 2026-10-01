from django.contrib import admin
from .models import Plant

@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ('user', 'tahap', 'poin_nutrisi', 'kesehatan', 'status', 'tanggal_mulai_siklus')