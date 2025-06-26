# monapp/serializers/reservation_serializer.py
from rest_framework import serializers
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from ..models.reservations import Reservation
from ..models.utilisateur import Utilisateur
from ..models.etudiant import Etudiant
from ..models.jour import Jour
from .jour_serializer import JourSerializer
from .periode_serializer import PeriodeSerializer
from ..models.periode import Periode
from .etudiant_serializer import EtudiantSerializer

class ReservationSerializer(serializers.ModelSerializer):
    initiateur     = serializers.StringRelatedField()    # affiche email ou __str__ de Utilisateur
    reservant_pour = EtudiantSerializer(read_only=True)
    jour           = JourSerializer(read_only=True)
    periode        = PeriodeSerializer(read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'date', 'heure', 'statut',
            'initiateur', 'reservant_pour',
            'jour', 'periode',
        ]
        read_only_fields = fields  # tout en lecture seule
    

class ReservationCreateSerializer(serializers.ModelSerializer):
    # on reçoit les PK pour jour, période et bénéficiaire
    reservant_pour = serializers.PrimaryKeyRelatedField(
        queryset=Etudiant.objects.all(),
        help_text="ID de l'étudiant bénéficiaire"
    )
    jour           = serializers.PrimaryKeyRelatedField(queryset=Jour.objects.all())
    periode        = serializers.PrimaryKeyRelatedField(queryset=Periode.objects.all())

    class Meta:
        model = Reservation
        fields = ['date', 'heure', 'jour', 'periode', 'reservant_pour']

    def validate(self, attrs):
        beneficiary = attrs['reservant_pour']
        d, p = attrs['date'], attrs['periode']
        # 1) Un seul créneau valide par jour/période/bénéficiaire
        if Reservation.objects.filter(
            reservant_pour=beneficiary,
            date=d,
            periode=p,
            statut='VALIDE'
        ).exists():
            raise serializers.ValidationError(
                "Ce bénéficiaire a déjà une réservation valide pour ce jour et cette période."
            )
        # 2) Pas de date passée
        if d < timezone.localdate():
            raise serializers.ValidationError("Impossible de réserver pour une date passée.")
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        user = self.context['request'].user
        # 1) création de la réservation
        res = Reservation.objects.create(
            initiateur=user,
            **validated_data
        )
        # 2) si l'initiateur est étudiant, on décrémente son quota
        if user.role == 'ETUDIANT':
            etu = user.etudiant
            # on choisit le champ en fonction de la période
            if res.periode.nomPeriode.lower().startswith('petit'):
                etu.ticket_quota_80 = F('ticket_quota_80') - 1
                etu.save(update_fields=['ticket_quota_80'])
            else:
                etu.ticket_quota_125 = F('ticket_quota_125') - 1
                etu.save(update_fields=['ticket_quota_125'])
        return res
