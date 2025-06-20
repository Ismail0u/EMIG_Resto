# monapp/serializers/reservation_serializer.py
from rest_framework import serializers
from ..models.reservations import Reservation
from ..models.jour import Jour
from ..models.periode import Periode
from .etudiant_serializer import EtudiantSerializer
from .jour_serializer import JourSerializer
from .periode_serializer import PeriodeSerializer
from django.utils import timezone
from datetime import time, date
from rest_framework_simplejwt.authentication import JWTAuthentication

class ReservationSerializer(serializers.ModelSerializer):
    etudiant        = EtudiantSerializer(read_only=True)
    reservant_pour  = EtudiantSerializer(read_only=True)
    jour            = JourSerializer(read_only=True)
    periode         = PeriodeSerializer(read_only=True)
    beneficiaire    = serializers.SerializerMethodField()
    details         = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'date', 'heure', 'statut',
            'etudiant', 'reservant_pour',
            'jour', 'periode',
            'beneficiaire', 'details'
        ]
        read_only_fields = ['id', 'statut', 'beneficiaire', 'details']

    def get_beneficiaire(self, obj):
        return EtudiantSerializer(obj.beneficiaire).data

    def get_details(self, obj):
        return obj.get_details()


class ReservationCreateSerializer(serializers.ModelSerializer):
    jour = serializers.PrimaryKeyRelatedField(queryset=Jour.objects.all())
    periode = serializers.PrimaryKeyRelatedField(queryset=Periode.objects.all())
    reservant_pour = serializers.PrimaryKeyRelatedField(
        queryset=Reservation._meta.get_field('reservant_pour').related_model.objects.all(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = Reservation
        fields = ['jour', 'periode', 'date', 'heure', 'reservant_pour']
        extra_kwargs = {
            'date': {'required': True},
            'heure': {'required': True},
        }

    def validate(self, attrs):
        # Authentification JWT obligatoire
        request = self.context.get('request')
        jwt_auth = JWTAuthentication()
        user_auth = jwt_auth.authenticate(request)
        
        if not user_auth:
            raise serializers.ValidationError("Authentification requise")
            
        user = user_auth[0]

        # Si l'utilisateur n'a pas d'étudiant associé, on ne peut pas réserver
        if not hasattr(user, 'etudiant'):
            raise serializers.ValidationError("L'utilisateur n'est pas un étudiant.")

        # Si aucun bénéficiaire n'est fourni, on réserve pour l'étudiant de l'utilisateur
        reservant = attrs.get('reservant_pour') or user.etudiant
        reservation_date = attrs.get('date')
        reservation_jour = attrs.get('jour')
        reservation_periode = attrs.get('periode')

        # Condition 1: Ne peut pas réserver deux fois pour même jour/période/date
        if Reservation.objects.filter(
            reservant_pour=reservant,
            jour=reservation_jour,
            periode=reservation_periode,
            date=reservation_date
        ).exists():
            raise serializers.ValidationError(
                "Vous avez déjà une réservation pour ce jour et cette période à cette date."
            )

        # Condition 2: Ne peut pas réserver pour aujourd'hui sauf le lundi avant 11h
        today = timezone.localdate()
        now = timezone.localtime().time()

        if reservation_date == today:
            if today.weekday() == 0 and now < time(11, 0):
                pass
            else:
                raise serializers.ValidationError(
                    "Vous ne pouvez pas réserver pour aujourd'hui, sauf si c'est Lundi avant 11h."
                )
        elif reservation_date < today:
            raise serializers.ValidationError(
                "Vous ne pouvez pas réserver pour une date passée."
            )

        return attrs