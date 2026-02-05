from rest_framework import serializers
from .models import AILog

class AILogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AILog
        fields = '__all__'
