from django.db import models

# Transport
class TransportRoute(models.Model):
    name = models.CharField(max_length=100) # e.g. Route A - Kampala North
    vehicle_number = models.CharField(max_length=20)
    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=20)
    monthly_fee = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class TransportStop(models.Model):
    route = models.ForeignKey(TransportRoute, on_delete=models.CASCADE, related_name='stops')
    stop_name = models.CharField(max_length=100)
    pickup_time = models.TimeField()

    def __str__(self):
        return f"{self.stop_name} ({self.route.name})"

# Hostel
class Hostel(models.Model):
    name = models.CharField(max_length=100)
    gender_served = models.CharField(max_length=10, choices=[('BOYS', 'Boys'), ('GIRLS', 'Girls'), ('MIXED', 'Mixed')])
    warden_name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Room(models.Model):
    hostel = models.ForeignKey(Hostel, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=20)
    capacity = models.PositiveIntegerField()
    occupancy = models.PositiveIntegerField(default=0)
    fee_per_term = models.DecimalField(max_digits=10, decimal_places=2)

    @property
    def is_full(self):
        return self.occupancy >= self.capacity

    def __str__(self):
        return f"{self.hostel.name} - Room {self.room_number}"

class RoomAllocation(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='allocations')
    student = models.ForeignKey('users.User', on_delete=models.CASCADE, limit_choices_to={'role': 'STUDENT'})
    allocated_date = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.student.get_full_name()} in {self.room.room_number}"
