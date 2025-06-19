# serializers/personnel_serializer.py
from rest_framework import serializers
from ..models.utilisateur import Utilisateur
from ..models.personnel import (
    Administrateur, ChefServiceRestaurant,
    Magasinier, VendeurTicket, ResponsableGuichet
)

class PersonnelBaseSerializer(serializers.ModelSerializer):
    utilisateur = serializers.PrimaryKeyRelatedField(
        queryset=Utilisateur.objects.all()
    )

    class Meta:
        abstract = True
        fields = ['id', 'utilisateur']
        read_only_fields = ['id']

class AdministrateurSerializer(PersonnelBaseSerializer):
    class Meta(PersonnelBaseSerializer.Meta):
        model = Administrateur

class ChefServiceSerializer(PersonnelBaseSerializer):
    class Meta(PersonnelBaseSerializer.Meta):
        model = ChefServiceRestaurant

class MagasinierSerializer(PersonnelBaseSerializer):
    class Meta(PersonnelBaseSerializer.Meta):
        model = Magasinier

class VendeurTicketsSerializer(PersonnelBaseSerializer):
    class Meta(PersonnelBaseSerializer.Meta):
        model = VendeurTicket

class ResponsableGuichetSerializer(PersonnelBaseSerializer):
    class Meta(PersonnelBaseSerializer.Meta):
        model = ResponsableGuichet
