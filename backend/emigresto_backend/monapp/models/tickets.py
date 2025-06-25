# restoapp/models/ticket.py
import uuid
from django.db import models
from django.utils import timezone
from .etudiant import Etudiant
from .personnel import VendeurTicket 

class Ticket(models.Model):
    PETIT_DEJ  = 'PETIT'
    DEJ_DINER  = 'DEJ'
    TYPE_CHOICES = [
        (PETIT_DEJ, 'Petit-déjeuner (80 FCFA)'),
        (DEJ_DINER, 'Déjeuner/DINER (125 FCFA)'),
    ]
    PRICES = {
        PETIT_DEJ: 80,
        DEJ_DINER: 125,
    }

    id            = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    etudiant      = models.ForeignKey(Etudiant, on_delete=models.PROTECT, related_name='tickets')
    type_ticket   = models.CharField(max_length=5, choices=TYPE_CHOICES)
    prix          = models.PositiveIntegerField(editable=False)
    date_vente    = models.DateTimeField(default=timezone.now)
    qr_code       = models.CharField(max_length=128, blank=True, null=True)
    vendeur       = models.ForeignKey(VendeurTicket, on_delete=models.PROTECT, related_name='tickets')

    class Meta:
        db_table = 'ticket'
        ordering = ['-date_vente']

    def save(self, *args, **kwargs):
    # Prix automatique selon le type
        self.prix = self.PRICES.get(self.type_ticket, 0)

    # QR code génération simple (UUID)
        if not self.qr_code:
            self.qr_code = str(self.id)

    # Si c’est une création (pas une mise à jour)
        if self._state.adding:
            if self.type_ticket == self.PETIT_DEJ:
                self.etudiant.ticket_quota_80 += 1
            elif self.type_ticket == self.DEJ_DINER:
                self.etudiant.ticket_quota_125 += 1

            self.etudiant.save(update_fields=['ticket_quota_80', 'ticket_quota_125'])

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Ticket {self.id} – {self.get_type_ticket_display()} – {self.prix} FCFA"
