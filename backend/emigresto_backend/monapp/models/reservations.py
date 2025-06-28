# monapp/models/reservation.py
from django.db import models
from django.db.models import F
from django.utils import timezone
from .utilisateur import Utilisateur
from .etudiant import Etudiant
from .jour import Jour
from .periode import Periode

class Reservation(models.Model):
    STATUT_CHOICES = [
        ('VALIDE', 'Valide'),
        ('ANNULE', 'Annulée'),
    ]

    id               = models.BigAutoField(primary_key=True)
    date             = models.DateField(
        help_text="Date de la réservation (détermine la semaine ciblée)"
    )
    heure            = models.TimeField(default=timezone.now)
    statut           = models.CharField(
        max_length=10, choices=STATUT_CHOICES, default='VALIDE'
    )
    # QUI a initié la réservation :
    initiateur       = models.ForeignKey(
        Utilisateur, on_delete=models.CASCADE,
        related_name='reservations_initiees'
    )
    # POUR QUI (toujours un étudiant) :
    reservant_pour   = models.ForeignKey(
        Etudiant, on_delete=models.PROTECT,
        related_name='reservations_beneficiees'
    )
    jour             = models.ForeignKey(
        Jour, on_delete=models.PROTECT, related_name='reservations'
    )
    periode          = models.ForeignKey(
        Periode, on_delete=models.PROTECT, related_name='reservations'
    )

    class Meta:
        db_table = 'reservation'
        ordering = ['-date', 'periode__nomPeriode']
        unique_together = ('reservant_pour', 'date', 'periode','jour')

    def __str__(self):
        return (
            f"#{self.id} {self.initiateur.email} → "
            f"{self.reservant_pour.get_fullName} / "
            f"{self.periode.nomPeriode} le {self.date}"
        )

    def annuler(self):
        if self.statut != 'ANNULE':
            self.statut = 'ANNULE'
            self.save(update_fields=['statut'])
    # @TODO: Re-evaluate if this method is still needed or if serializer validation is enough
    def creer(self):
        """Valide et enregistre une nouvelle réservation."""
        # This logic will mostly be handled by the serializer's validate method
        self.save()

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

    @property
    def beneficiaire(self):
        """Retourne l'Etudiant bénéficiaire de la réservation."""
        return self.reservant_pour 

    def get_details(self):
        """Chaîne descriptive de la réservation."""
        # Assuming Periode model has a 'nomPeriode' field,
        # or you might need to adjust this if it's 'nom_periode'
        # based on how you access it in other parts of your code.
        # Based on periode.py, it's nomPeriode.
        return (
            f"Réservation #{self.id} — Bénéficiaire : {self.beneficiaire.get_full_name}, "
            f"Jour : {self.jour.nomJour}, Période : {self.periode.nomPeriode}, "
            f"Date : {self.date}, Heure : {self.heure}, Statut : {self.statut}"
        )
