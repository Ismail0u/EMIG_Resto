# monapp/models/reservations.py
from django.db import models
from django.utils import timezone
from datetime import timedelta, time, date # Import time and date
from .etudiant import Etudiant
from .jour import Jour
from .periode import Periode

class Reservation(models.Model):
    STATUT_CHOICES = [
        ('VALIDE', 'Valide'),
        ('ANNULE', 'Annulée'),
    ]

    id          = models.BigAutoField(primary_key=True)
    date        = models.DateField() # Changed default=timezone.now, date will be provided by user
    heure       = models.TimeField(default=timezone.now) # This might be dynamic based on period, or can be fixed
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
        on_delete=models.PROTECT,
        related_name='reservations',
        help_text="Jour de la réservation"
    )
    periode     = models.ForeignKey(
        Periode,
        on_delete=models.PROTECT,
        related_name='reservations',
        help_text="Période de la réservation (Petit-déjeuner, Déjeuner, DINER)"
    )

    class Meta:
        db_table = 'reservation'
        # Fix: 'periode__ordre' was changed to 'periode__nomPeriode'
        # because the Periode model does not have an 'ordre' field,
        # but it does have 'nomPeriode'.
        ordering = ['date', 'periode__nomPeriode']
        unique_together = ('etudiant', 'date', 'periode')

    def __str__(self):
        # Assuming Periode model has a 'nomPeriode' field,
        # or you might need to adjust this if it's 'nom_periode'
        # based on how you access it in other parts of your code.
        # Based on periode.py, it's nomPeriode.
        return f"Réservation de {self.etudiant.get_full_name} pour {self.periode.nomPeriode} le {self.date}"


    # @TODO: Re-evaluate if this method is still needed or if serializer validation is enough
    def creer(self):
        """Valide et enregistre une nouvelle réservation."""
        # This logic will mostly be handled by the serializer's validate method
        self.save()

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

    @property
    def beneficiaire(self):
        """Retourne l'Etudiant bénéficiaire de la réservation."""
        return self.reservant_pour or self.etudiant

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
