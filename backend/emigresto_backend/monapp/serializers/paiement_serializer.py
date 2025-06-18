# serializers/paiement_serializer.py
from rest_framework import serializers
from ..models.paiement import Paiement
from ..models.etudiant import Etudiant
from .etudiant_serializer import EtudiantSerializer

class PaiementSerializer(serializers.ModelSerializer):
    etudiant = EtudiantSerializer(read_only=True)
    etudiant_id = serializers.PrimaryKeyRelatedField(
        queryset=Etudiant.objects.all(), write_only=True, source='etudiant'
    )

    class Meta:
        model = Paiement
        fields = ['id', 'date', 'montant', 'mode_paiement', 'etudiant', 'etudiant_id']
        read_only_fields = ['id', 'date']
