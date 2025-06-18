# monapp/views/paiement_viewset.py
from ..models.etudiant import Etudiant
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import action

from ..models.paiement import Paiement
from ..serializers.paiement_serializer import PaiementSerializer
from .base_viewset import BaseModelViewSet

class PaiementViewSet(BaseModelViewSet):
    queryset = Paiement.objects.select_related('etudiant').all()
    serializer_class = PaiementSerializer
    search_fields = ['etudiant__matricule']
    ordering_fields = ['date']

def perform_create(self, serializer):
    mode = serializer.validated_data.get('mode_paiement', '').upper()
    serializer.save(mode_paiement=mode)



    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        """
        /api/paiements/{pk}/annuler/  → supprime le paiement.
        Utile si on veut pouvoir "défaire" un paiement.
        """
        paiement = self.get_object()
        paiement.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
