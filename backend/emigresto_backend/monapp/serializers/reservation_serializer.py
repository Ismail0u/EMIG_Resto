# monapp/serializers/reservation_serializer.py
from rest_framework import serializers
from ..models.reservations import Reservation
from ..models.jour import Jour
from ..models.periode import Periode
from ..models.etudiant import Etudiant # Ensure Etudiant is imported here for direct use
from .etudiant_serializer import EtudiantSerializer
from .jour_serializer import JourSerializer
from .periode_serializer import PeriodeSerializer
from django.utils import timezone
from datetime import time, date

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
    class Meta:
        model = Reservation
        fields = [
            'date', 'heure', 'jour', 'periode', 'reservant_pour'
        ]
        read_only_fields = ['statut', 'etudiant'] 

    def validate(self, attrs):
        # Retrieve necessary objects from validated data or context
        # Determine the 'beneficiary' (the person for whom the reservation is made)
        # This is used for the frontend-level validation
        current_user_etudiant = self.context['request'].user.etudiant
        reservant_for_validation = attrs.get('reservant_pour') or current_user_etudiant

        reservation_date = attrs.get('date')
        reservation_jour = attrs.get('jour')
        reservation_periode = attrs.get('periode')

        # Frontend Validation: Cannot reserve twice for the same day and period on the same date (for the beneficiary)
        # ONLY CHECK FOR ACTIVE (VALID) RESERVATIONS
        if Reservation.objects.filter(
            # This check uses 'reservant_pour' because it's about the beneficiary's unique active reservation
            reservant_pour=reservant_for_validation, 
            jour=reservation_jour,
            periode=reservation_periode,
            date=reservation_date,
            statut='VALIDE' 
        ).exists():
            raise serializers.ValidationError(
                "Vous avez déjà une réservation valide pour ce jour et cette période à cette date pour ce bénéficiaire."
            )

        # Condition 2: Cannot reserve for the current day, except for Monday before 11 AM
        today = timezone.localdate()
        now = timezone.localtime().time()

        if reservation_date == today:
            if today.weekday() == 0 and now < time(11, 0): # Monday before 11 AM
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

    def create(self, validated_data):
        # 'etudiant' (initiator) is set by the ReservationViewSet's perform_create method
        etudiant_initiating = validated_data.get('etudiant') 
        if etudiant_initiating is None:
            # Fallback for etudiant_initiating if not explicitly set (should be set by viewset)
            etudiant_initiating = self.context['request'].user.etudiant

        # Determine the 'beneficiary' (reservant_pour)
        reservant_for_creation = validated_data.get('reservant_pour')
        if reservant_for_creation is None:
            reservant_for_creation = etudiant_initiating # If not specified, the initiator is the beneficiary

        # --- NEW LOGIC: Attempt to find and reactivate a cancelled reservation ---
        try:
            # We look for a *cancelled* reservation that was initiated by the *same student* (etudiant_id)
            # for the same date and period, because this matches your database's unique constraint.
            existing_cancelled_reservation = Reservation.objects.get(
                etudiant=etudiant_initiating,  # This matches the 'etudiant_id' from the unique constraint
                date=validated_data['date'],
                periode=validated_data['periode'],
                statut='ANNULE'
            )
            
            # If found, update its status and other relevant fields
            existing_cancelled_reservation.statut = 'VALIDE'
            existing_cancelled_reservation.jour = validated_data['jour'] # Update day if necessary
            existing_cancelled_reservation.heure = validated_data['heure'] # Update hour if necessary
            existing_cancelled_reservation.reservant_pour = reservant_for_creation # Update beneficiary if necessary
            existing_cancelled_reservation.save()
            return existing_cancelled_reservation

        except Reservation.DoesNotExist:
            # If no existing cancelled reservation matches the unique constraint (etudiant_id, date, periode_id),
            # then proceed to create a new reservation.
            return Reservation.objects.create(**validated_data)