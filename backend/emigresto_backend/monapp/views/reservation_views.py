# monapp/views/reservation_views.py
from rest_framework import viewsets, permissions
from monapp.models.reservations import Reservation
from monapp.serializers.reservation_serializer import (
    ReservationSerializer,
    ReservationCreateSerializer
)

class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Si l'utilisateur est un responsable de guichet (ou a une permission spécifique)
        # Il pourra voir toutes les réservations
        if user.is_staff or user.has_perm('monapp.view_all_reservations'): # Exemple de vérification de permission
            return Reservation.objects.all().order_by('-date', '-heure') # Ordonner pour un affichage plus cohérent
        try:
            # Sinon, il ne voit que ses propres réservations
            etudiant = user.as_etudiant
            return Reservation.objects.filter(etudiant=etudiant).order_by('-date', '-heure')
        except Exception:
            return Reservation.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReservationCreateSerializer
        return ReservationSerializer

    def perform_create(self, serializer):
        etudiant = self.request.user.as_etudiant
        serializer.save(etudiant=etudiant)

    # Pour la mise à jour du statut, on pourrait avoir une action personnalisée ou utiliser update/partial_update
    # Il faudra que le front-end envoie le statut mis à jour (par exemple, 'ANNULE' ou 'VALIDE')