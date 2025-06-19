# views/ticket_viewset.py
from ..models.tickets import Ticket
from ..serializers.ticket_serializer import TicketSerializer
from .base_viewset import BaseModelViewSet

class TicketViewSet(BaseModelViewSet):
    queryset = Ticket.objects.select_related('etudiant').all()
    serializer_class = TicketSerializer
    filterset_fields = ['type_ticket', 'date_vente']
    search_fields = ['etudiant__matricule']
    ordering_fields = ['date_vente', 'prix']
    


