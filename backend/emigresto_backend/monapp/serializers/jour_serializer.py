# monapp/serializers/jour_serializer.py
from rest_framework import serializers
from ..models.jour import Jour
# No need to import Periode here if using static methods from Jour model

class JourSerializer(serializers.ModelSerializer):
    # Existing daily fields (now consistent with tomorrow's date)
    nbre_reserve_jour       = serializers.SerializerMethodField()
    reservations_petit_dej  = serializers.SerializerMethodField()
    reservations_dejeuner   = serializers.SerializerMethodField()
    reservations_diner      = serializers.SerializerMethodField()

    # --- NEW: Weekly Reservation Fields ---
    weekly_total_reservations = serializers.SerializerMethodField()
    weekly_petit_dej_reservations = serializers.SerializerMethodField()
    weekly_dejeuner_reservations = serializers.SerializerMethodField()
    weekly_diner_reservations = serializers.SerializerMethodField()

    class Meta:
        model = Jour
        fields = [
            'id',
            'nomJour',
            'nbre_reserve_jour',          # This now means 'total for this day tomorrow'
            'reservations_petit_dej',     # For tomorrow, periode 1
            'reservations_dejeuner',      # For tomorrow, periode 2
            'reservations_diner',         # For tomorrow, periode 3
            # --- Add new weekly fields here ---
            'weekly_total_reservations',
            'weekly_petit_dej_reservations',
            'weekly_dejeuner_reservations',
            'weekly_diner_reservations',
        ]
        read_only_fields = fields # All are read-only calculated fields

    # --- Existing daily methods (calling updated model methods) ---
    def get_nbre_reserve_jour(self, obj):
        return obj.get_nbre_reserve_jour # This now refers to the property on the Jour model

    def get_reservations_petit_dej(self, obj):
        # Assuming period ID 1 is Petit-déjeuner
        return obj.get_nbre_reserve_lendemain(3)

    def get_reservations_dejeuner(self, obj):
        # Assuming period ID 2 is Déjeuner
        return obj.get_nbre_reserve_lendemain(1)

    def get_reservations_diner(self, obj):
        # Assuming period ID 3 is Dîner
        return obj.get_nbre_reserve_lendemain(2)

    # --- NEW: Weekly methods (calling static methods on Jour model) ---
    def get_weekly_total_reservations(self, obj):
        return Jour.get_weekly_total_reservations()

    def get_weekly_petit_dej_reservations(self, obj):
        return Jour.get_weekly_reservations_by_period('Petit-Déjeuner')

    def get_weekly_dejeuner_reservations(self, obj):
        return Jour.get_weekly_reservations_by_period('Déjeuner')

    def get_weekly_diner_reservations(self, obj):
        return Jour.get_weekly_reservations_by_period('Diner')