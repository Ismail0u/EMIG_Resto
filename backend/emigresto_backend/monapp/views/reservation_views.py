from django.utils import timezone
from datetime import timedelta
from rest_framework import viewsets, permissions
from monapp.models.reservations import Reservation
from monapp.serializers.reservation_serializer import ReservationSerializer, ReservationCreateSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        today = timezone.localdate()
        start_of_week = today - timedelta(days=today.weekday())  # Lundi
        end_of_week = start_of_week + timedelta(days=6)          # Dimanche

        queryset = Reservation.objects.filter(date__range=(start_of_week, end_of_week))

        if user.is_staff or user.has_perm('monapp.view_all_reservations'):
            return queryset.order_by('-date', '-heure')

        try:
            etudiant = user.as_etudiant
            return queryset.filter(etudiant=etudiant).order_by('-date', '-heure')
        except Exception:
            return Reservation.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReservationCreateSerializer
        return ReservationSerializer

    def perform_create(self, serializer):
        etudiant = self.request.user.as_etudiant
        serializer.save(etudiant=etudiant)
