from rest_framework import serializers
from ..models.tickets import Ticket
from ..models.etudiant import Etudiant
from ..models.personnel import VendeurTicket
from .etudiant_serializer import EtudiantSerializer

class CurrentVendeurDefault:
    requires_context = True

    def __call__(self, serializer_field):
        request = serializer_field.context['request']
        # Récupère le profil VendeurTicket lié à l’utilisateur authentifié
        return VendeurTicket.objects.get(utilisateur=request.user)

class TicketSerializer(serializers.ModelSerializer):
    etudiant_id = serializers.PrimaryKeyRelatedField(
        queryset=Etudiant.objects.all(),
        write_only=True,
        source='etudiant'
    )
    # On associe automatiquement le VendeurTicket, pas l’utilisateur
    vendeur = serializers.HiddenField(default=CurrentVendeurDefault())

    etudiant = EtudiantSerializer(read_only=True)
    qr_code  = serializers.CharField(read_only=True)
    prix     = serializers.IntegerField(read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id',
            'etudiant',
            'etudiant_id',
            'vendeur',
            'type_ticket',
            'prix',
            'date_vente',
            'qr_code',
        ]
        read_only_fields = ['id', 'etudiant', 'prix', 'date_vente', 'qr_code']
