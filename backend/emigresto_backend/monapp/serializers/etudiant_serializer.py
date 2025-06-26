from rest_framework import serializers
from ..models.etudiant import Etudiant

class EtudiantSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Etudiant
        fields = ['id', 'matricule', 'nom', 'prenom', 'email',
                  'telephone', 'sexe', 'ticket_quota_80','ticket_quota_125','full_name']
        read_only_fields = ['id', 'full_name',]


    def get_full_name(self, obj):
        return obj.get_fullName
