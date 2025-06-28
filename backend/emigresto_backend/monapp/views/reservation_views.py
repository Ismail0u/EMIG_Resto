# reservation_views.py - Version corrigée
from datetime import timedelta
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from ..models.reservations import Reservation
from ..serializers.reservation_serializer import (
    ReservationSerializer,
    ReservationCreateSerializer
)

# Liste des rôles qui doivent voir *toutes* les résas
FULL_ACCESS_ROLES = {
    'ADMIN',
    'RESPONSABLE_GUICHET',
    # tu peux y ajouter d'autres rôles plus tard...
}

class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = Reservation.objects.all()

        if user.is_staff or user.role in FULL_ACCESS_ROLES:
        # plus aucun filtre → le responsable voit tout
            return base_qs.order_by('-date', '-heure')

    # sinon, on garde la logique restreinte
        start = timezone.localdate()
        end   = start + timedelta(days=6)
        return (
        base_qs
        .filter(initiateur=user, date__range=(start, end))
        .order_by('-date', '-heure')
    )

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ReservationCreateSerializer
        return ReservationSerializer

    def perform_create(self, serializer):
        serializer.context['request'] = self.request
        serializer.save()