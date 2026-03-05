from rest_framework import serializers, viewsets
from users.permissions import IsAdminOrReadOnly
from .models import TransportRoute, TransportStop, Hostel, Room, RoomAllocation


# ── Serializers ──────────────────────────────────────────────────────────────

class TransportStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransportStop
        fields = '__all__'


class TransportRouteSerializer(serializers.ModelSerializer):
    stops = TransportStopSerializer(many=True, read_only=True)

    class Meta:
        model = TransportRoute
        fields = '__all__'


class HostelSerializer(serializers.ModelSerializer):
    room_count = serializers.IntegerField(source='rooms.count', read_only=True)

    class Meta:
        model = Hostel
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    hostel_name = serializers.CharField(source='hostel.name', read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Room
        fields = '__all__'


class RoomAllocationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    room_label = serializers.SerializerMethodField()

    class Meta:
        model = RoomAllocation
        fields = '__all__'

    def get_room_label(self, obj):
        return str(obj.room)


# ── ViewSets ─────────────────────────────────────────────────────────────────

class TransportViewSet(viewsets.ModelViewSet):
    queryset = TransportRoute.objects.prefetch_related('stops').all()
    serializer_class = TransportRouteSerializer
    permission_classes = [IsAdminOrReadOnly]


class HostelViewSet(viewsets.ModelViewSet):
    queryset = Hostel.objects.prefetch_related('rooms').all()
    serializer_class = HostelSerializer
    permission_classes = [IsAdminOrReadOnly]


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.select_related('hostel').all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['hostel']


class AllocationViewSet(viewsets.ModelViewSet):
    queryset = RoomAllocation.objects.select_related('room', 'room__hostel', 'student').all()
    serializer_class = RoomAllocationSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['room', 'is_active']
