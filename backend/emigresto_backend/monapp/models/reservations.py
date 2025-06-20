# monapp/models/reservations.py

from django.db import models
from django.utils import timezone
from datetime import timedelta, time, date

# Import Etudiant, Jour, Periode as you already have
from .etudiant import Etudiant
from .jour import Jour
from .periode import Periode

class Reservation(models.Model):
    STATUT_CHOICES = [
        ('VALIDE', 'Valide'),
        ('ANNULE', 'Annulée'),
        ('EXPIRED', 'Expirée'), # New status for expired reservations
    ]

    id          = models.BigAutoField(primary_key=True)
    date        = models.DateField()
    heure       = models.TimeField(default=timezone.now)
    statut      = models.CharField(max_length=10, choices=STATUT_CHOICES, default='VALIDE')
    etudiant    = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name='reservations_effectuees',
        help_text="L'étudiant qui initie la réservation"
    )
    reservant_pour = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        related_name='reservations_recueillies',
        null=True,
        blank=True,
        help_text="Optionnel : matricule du camarade pour qui on réserve"
    )
    jour        = models.ForeignKey(
        Jour,
        on_delete=models.CASCADE,
        related_name='reservations',
        help_text="Le jour de la semaine pour la réservation"
    )
    periode     = models.ForeignKey(
        Periode,
        on_delete=models.CASCADE,
        related_name='reservations',
        help_text="La période (petit-déj, déjeuner, dîner) de la réservation"
    )
    created_at = models.DateTimeField(auto_now_add=True) # Useful for tracking
    updated_at = models.DateTimeField(auto_now=True)    # Useful for tracking

    class Meta:
        # Ensures no duplicate reservations for the same student, day, period, and date
        unique_together = ('reservant_pour', 'jour', 'periode', 'date')
        verbose_name = "Réservation"
        verbose_name_plural = "Réservations"
        ordering = ['date', 'periode__nomPeriode', 'jour__id'] # Order by date, then period name, then day ID

    def __str__(self):
        beneficiary_name = self.beneficiaire.get_full_name() if self.beneficiaire else "N/A"
        return f"Réservation pour {beneficiary_name} le {self.date} ({self.jour.nomJour}, {self.periode.nomPeriode}) - Statut: {self.statut}"

    def clean(self):
        # Additional validation can go here if needed, but serializer handles most of it.
        pass

    def save(self, *args, **kwargs):
        self.full_clean() # Ensure model-level validation runs
        super().save(*args, **kwargs)

    def valider(self):
        """Valide et enregistre une nouvelle réservation."""
        self.statut = 'VALIDE'
        self.save(update_fields=['statut'])

    def annuler(self):
        """Annule la réservation (soft)."""
        self.statut = 'ANNULE'
        self.save(update_fields=['statut'])

    def modifier(self, **kwargs):
        """
        Modifie un ou plusieurs champs de la réservation.
        Usage : instance.modifier(jour=new_jour, periode=new_periode)
        """
        allowed = {'date', 'heure', 'jour', 'periode', 'statut', 'reservant_pour'}
        for field, val in kwargs.items():
            if field in allowed:
                setattr(self, field, val)
        self.save()

    def mark_as_expired(self):
        """Marks the reservation as expired."""
        if self.statut != 'ANNULE': # Only mark as expired if not already cancelled
            self.statut = 'EXPIRED'
            self.save(update_fields=['statut'])

    @property
    def beneficiaire(self):
        """Retourne l'Etudiant bénéficiaire de la réservation."""
        return self.reservant_pour or self.etudiant

    def get_details(self):
        """Chaîne descriptive de la réservation."""
        return (
            f"Réservation #{self.id} — Bénéficiaire : {self.beneficiaire.get_full_name()}, "
            f"Date: {self.date.strftime('%Y-%m-%d')}, Heure: {self.heure.strftime('%H:%M')}, "
            f"Jour: {self.jour.nomJour}, Période: {self.periode.nomPeriode}, Statut: {self.statut}"
        )

    # Consider adding a custom manager for more complex queries related to reservations
    # For example, Reservation.objects.active().for_today()