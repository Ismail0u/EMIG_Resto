from django.db import models
from .utilisateur import Utilisateur

class Etudiant(Utilisateur):
    SEXE_CHOICES = [ ('M', 'Masculin'),
        ('F', 'Féminin'),
    ]

    matricule = models.CharField(max_length=20, unique=True)
    solde = models.DecimalField(
        max_digits=10, decimal_places=2,
        default=0,
        help_text="Solde du compte étudiant"
    )
    
    ticket_quota_80 = models.PositiveIntegerField(default=0, help_text="Tickets numériques restants")
    ticket_quota_125 = models.PositiveIntegerField(default=0, help_text="Tickets numériques restants")
   
    
    sexe = models.CharField(
        max_length=1,
        choices=SEXE_CHOICES,
        # blank=False, # Removed blank=True, null=True to make it required
        # null=False, # Removed blank=True, null=True to make it required
        help_text="Sexe de l'étudiant"
    )

    class Meta:
        verbose_name = "Étudiant"
        db_table = 'etudiant'

    def reserver_repas(self, jour, periode, date, heure):
        from .reservations import Reservation # Import here to avoid circular dependency
        return Reservation.objects.create(
            etudiant=self,
            jour=jour,
            periode=periode,
            date=date,
            heure=heure
        )

    def annuler_reservation(self, reservation_id):
        from .reservations import Reservation # Import here
        try:
            reservation = Reservation.objects.get(id=reservation_id, etudiant=self)
            reservation.delete()
            return True
        except Reservation.DoesNotExist:
            return False

    def get_historique_reservations(self):
        from .reservations import Reservation # Import here
        return Reservation.objects.filter(etudiant=self).order_by('-date', '-heure')

    def get_tickets(self):
        from .ticket import Ticket # Import here
        return Ticket.objects.filter(etudiant=self)

    def payer_ticket(self, montant):
        from .paiement import Paiement # Import here
        return Paiement.objects.create(
            etudiant=self,
            montant=montant,
            mode_paiement='solde'
        )

    @property
    def get_fullName(self):
        return f"{self.nom} {self.prenom}"

    def existe_reserv_pour_periode_date(self, periode, date=None):
        from .reservations import Reservation # Import here
        from datetime import date as today_date

        check_date = date or today_date.today()
        return Reservation.objects.filter(
            etudiant=self,
            periode=periode,
            date=check_date
        ).exists()

    def crediter(self, montant):
        """Ajoute `montant` au solde et sauvegarde."""
        if montant <= 0:
            raise ValueError("Le montant doit être positif.")
        self.solde += montant
        self.save(update_fields=['solde'])
        return self.solde

    def debiter(self, montant):
        """Débite `montant` du solde si suffisant."""
        if montant <= 0:
            raise ValueError("Le montant doit être positif.")
        if self.solde < montant:
            raise ValueError("Solde insuffisant.")
        self.solde -= montant
        self.save(update_fields=['solde'])
        return self.solde