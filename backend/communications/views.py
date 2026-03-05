from rest_framework import viewsets
from .models import Announcement, MessageLog
from rest_framework import serializers

class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    class Meta:
        model = Announcement
        fields = '__all__'

class MessageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageLog
        fields = '__all__'

class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

class MessageLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MessageLog.objects.all()
    serializer_class = MessageLogSerializer
