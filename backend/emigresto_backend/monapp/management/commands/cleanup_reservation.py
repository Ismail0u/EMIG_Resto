# monapp/management/commands/cleanup_reservations.py

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from monapp.models.reservations import Reservation # Adjust import based on your app name

class Command(BaseCommand):
    help = 'Marks reservations older than the current week as EXPIRED.'

    def handle(self, *args, **kwargs):
        today = timezone.localdate()
        # Calculate the start of the current week (Monday)
        # weekday() returns 0 for Monday, 6 for Sunday
        start_of_current_week = today - timedelta(days=today.weekday())

        # Reservations to expire are those with a date strictly before the start of the current week
        # and are currently 'VALIDE' (or any other status you want to expire)
        reservations_to_expire = Reservation.objects.filter(
            date__lt=start_of_current_week,
            statut='VALIDE' # Only expire active reservations
        )

        num_updated = 0
        for reservation in reservations_to_expire:
            reservation.mark_as_expired()
            num_updated += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully marked {num_updated} old reservations as EXPIRED.'
        ))

        # Optional: Delete really old 'EXPIRED' or 'ANNULE' reservations if you don't need them
        # one_month_ago = today - timedelta(days=30)
        # old_expired_reservations = Reservation.objects.filter(
        #     date__lt=one_month_ago,
        #     statut='EXPIRED'
        # )
        # num_deleted, _ = old_expired_reservations.delete()
        # self.stdout.write(self.style.SUCCESS(
        #     f'Successfully deleted {num_deleted} very old expired reservations.'
        # ))