from django.utils import timezone
from datetime import timedelta, date # <--- ADDED 'date' here
from rest_framework import viewsets, permissions # Already there for ReservationViewSet
from rest_framework.views import APIView # <--- REQUIRED for CancelReservationView
from rest_framework.response import Response # <--- REQUIRED for CancelReservationView
from rest_framework import status # <--- REQUIRED for status codes
from rest_framework.permissions import IsAuthenticated # <--- REQUIRED for CancelReservationView permissions

# Ensure these model imports are correct relative to your project structure
# Assuming 'monapp/models/reservations.py' means 'monapp.models.reservations'
from monapp.models.reservations import Reservation
from monapp.models.jour import Jour # <--- REQUIRED for CancelReservationView
from monapp.models.periode import Periode # <--- REQUIRED for CancelReservationView

from monapp.serializers.reservation_serializer import ReservationSerializer, ReservationCreateSerializer

class ReservationViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        today = timezone.localdate()
        start_of_week = today - timedelta(days=today.weekday())  # Lundi
        end_of_week = start_of_week + timedelta(days=6)          # Dimanche

        queryset = Reservation.objects.filter(date__range=(start_of_week, end_of_week))

        if user.is_staff or user.has_perm('monapp.view_all_reservations'):
            return queryset.order_by('-date', '-heure')

        try:
            etudiant = user.as_etudiant
            return queryset.filter(etudiant=etudiant).order_by('-date', '-heure')
        except Exception:
            return Reservation.objects.none()

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ReservationCreateSerializer
        return ReservationSerializer

    def perform_create(self, serializer):
        etudiant = self.request.user.as_etudiant
        serializer.save(etudiant=etudiant)
class CancelReservationView(APIView):
    """
    API view to handle cancellation of multiple reservations for the authenticated user.
    Expects a JSON body with 'reservations_to_cancel' field.
    Example Request Body:
    {
        "reservations_to_cancel": {
            "Petit-Déjeuner": ["Lun", "Mar"],
            "Déjeuner": ["Mer"]
        }
    }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Assumes request.user has a one-to-one field 'etudiant' linking to your Etudiant model
        user_etudiant = request.user.etudiant
        reservations_to_cancel_data = request.data.get('reservations_to_cancel')

        if not reservations_to_cancel_data:
            return Response(
                {"detail": "No reservations specified for cancellation. 'reservations_to_cancel' field is missing."},
                status=status.HTTP_400_BAD_REQUEST
            )

        successful_cancellations = []
        failed_cancellations = []

        # Mapping full day names to their weekday number (Monday=0, Sunday=6)
        jour_name_to_weekday = {
            'Lundi': 0,
            'Mardi': 1,
            'Mercredi': 2,
            'Jeudi': 3,
            'Vendredi': 4,
            'Samedi': 5,
            'Dimanche': 6,
        }

        # Mapping abbreviation to full day name
        jour_abreviation_to_full = {
            'Lun': 'Lundi',
            'Mar': 'Mardi',
            'Mer': 'Mercredi',
            'Jeu': 'Jeudi',
            'Ven': 'Vendredi',
            'Sam': 'Samedi',
            'Dim': 'Dimanche',
        }

        # Calculate the start of the current week (Monday)
        today = date.today()
        # today.weekday() returns 0 for Monday, 1 for Tuesday, ..., 6 for Sunday
        start_of_current_week = today - timedelta(days=today.weekday())

        for periode_nom, jour_abreviations in reservations_to_cancel_data.items():
            try:
                # --- CHANGE IS HERE: Use __iexact for case-insensitive lookup ---
                periode = Periode.objects.get(nomPeriode__iexact=periode_nom)
            except Periode.DoesNotExist:
                failed_cancellations.append(f"Periode '{periode_nom}' not found in the system.")
                continue
            except Exception as e:
                failed_cancellations.append(f"Error fetching Periode '{periode_nom}': {str(e)}")
                continue

            if not isinstance(jour_abreviations, list):
                failed_cancellations.append(f"Days for periode '{periode_nom}' must be a list.")
                continue

            for jour_abreviation in jour_abreviations:
                full_jour_name = jour_abreviation_to_full.get(jour_abreviation)
                if not full_jour_name:
                    failed_cancellations.append(f"Invalid day abbreviation '{jour_abreviation}' for '{periode_nom}'.")
                    continue

                try:
                    jour_obj = Jour.objects.get(nomJour=full_jour_name)
                except Jour.DoesNotExist:
                    failed_cancellations.append(f"Day '{full_jour_name}' not found in the system for '{periode_nom}'.")
                    continue

                # Calculate the specific date for the reservation within the current week
                day_offset = jour_name_to_weekday[full_jour_name]
                reservation_date = start_of_current_week + timedelta(days=day_offset)

                try:
                    # Find the specific reservation for the authenticated user and specified criteria
                    # Also ensure it's not already cancelled
                    reservation = Reservation.objects.get(
                        etudiant=user_etudiant,
                        jour=jour_obj,
                        periode=periode,
                        date=reservation_date,
                        statut='VALIDE' # Only cancel active reservations
                    )
                    reservation.annuler() # Call the annuler method on the Reservation model
                    successful_cancellations.append({
                        "periode": periode_nom,
                        "jour": jour_abreviation,
                        "date": reservation_date.isoformat(),
                        "message": "Successfully cancelled."
                    })
                except Reservation.DoesNotExist:
                    failed_cancellations.append({
                        "periode": periode_nom,
                        "jour": jour_abreviation,
                        "date": reservation_date.isoformat(),
                        "message": "No active reservation found for this day and period, or already cancelled."
                    })
                except Exception as e:
                    failed_cancellations.append({
                        "periode": periode_nom,
                        "jour": jour_abreviation,
                        "date": reservation_date.isoformat(),
                        "message": f"An error occurred: {str(e)}"
                    })

        if successful_cancellations:
            return Response({
                "message": "Cancellation process completed.",
                "successful_cancellations": successful_cancellations,
                "failed_cancellations": failed_cancellations
            }, status=status.HTTP_200_OK)
        else:
            # If no successful cancellations but some failures, still return 400
            return Response({
                "message": "No reservations were successfully cancelled.",
                "failed_cancellations": failed_cancellations
            }, status=status.HTTP_400_BAD_REQUEST)