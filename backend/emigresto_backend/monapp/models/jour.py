# monapp/models/jour.py
from django.db import models
from django.utils import timezone
from datetime import timedelta, date # Import date for clarity

class Jour(models.Model):
    id       = models.AutoField(primary_key=True, db_column='id')
    nomJour  = models.CharField(db_column='nomJour', max_length=10)

    @property
    def get_nomJour(self):
        return self.nomJour

    @property
    def get_nbre_reserve_jour(self):
        # This method is used for 'nbre_reserve_jour' in serializer, which previously
        # showed an inconsistent total. Let's make it consistent with the 'tomorrow' logic.
        # It should count all valid reservations for 'tomorrow' and for THIS specific day of the week.
        from .reservations import Reservation # Import here to avoid circular imports
        tomorrow = timezone.localdate() + timedelta(days=1)
        return Reservation.objects.filter(
            date=tomorrow,
            jour=self, # Filter by the specific day of the week (e.g., Lundi, Mardi)
            statut='VALIDE' # Only count valid reservations
        ).count()

    def get_nbre_reserve_lendemain(self, periode_id):
        from .periode import Periode
        from .reservations import Reservation

        try:
            periode = Periode.objects.get(id=periode_id)
        except Periode.DoesNotExist:
            return 0

        lendemain = timezone.localdate() + timedelta(days=1)
        return Reservation.objects.filter(
            date=lendemain,
            jour=self,
            periode=periode,
            statut='VALIDE' # Only count valid reservations
        ).count()

    # --- NEW: Methods for Weekly Stats ---

    @staticmethod
    def get_current_week_start_end_dates():
        today = timezone.localdate()
        # today.weekday() returns 0 for Monday, 6 for Sunday.
        # Calculate days_since_monday to get the Monday of the current week.
        # If today is Monday (0), days_since_monday is 0.
        # If today is Saturday (5), days_since_monday is 5.
        # If today is Sunday (6), days_since_monday is 6.
        days_since_monday = today.weekday()
        week_start = today - timedelta(days=days_since_monday)
        week_end = week_start + timedelta(days=6) # Sunday of the current week
        return week_start, week_end

    @staticmethod
    def get_weekly_total_reservations():
        from .reservations import Reservation
        week_start, week_end = Jour.get_current_week_start_end_dates()
        return Reservation.objects.filter(
            date__range=[week_start, week_end],
            statut='VALIDE' # Count only valid reservations for the week
        ).count()

    @staticmethod
    def get_weekly_reservations_by_period(periode_name_keyword):
        from .reservations import Reservation
        from .periode import Periode
        week_start, week_end = Jour.get_current_week_start_end_dates()
        
        try:
            # Get all periods whose names contain the keyword (case-insensitive)
            # This handles cases like 'PETIT-DÉJEUNER' vs 'Petit-déjeuner'
            periodes = Periode.objects.filter(nomPeriode__icontains=periode_name_keyword)
            if not periodes.exists():
                return 0 # No matching periods found
            
            return Reservation.objects.filter(
                date__range=[week_start, week_end],
                periode__in=periodes, # Filter by the list of matching periods
                statut='VALIDE'
            ).count()
        except Exception as e:
            # Log the error if necessary
            print(f"Error in get_weekly_reservations_by_period: {e}")
            return 0

    class Meta:
        db_table = 'jour'