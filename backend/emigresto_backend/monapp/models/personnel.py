from django.db import models
from .utilisateur import Utilisateur

class PersonnelRestaurant(models.Model):
    utilisateur = models.OneToOneField(
        Utilisateur,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="%(class)ss"
    )
    # aucun autre champ ici

    class Meta:
        abstract = True

class Administrateur(PersonnelRestaurant):
    class Meta:
        db_table = 'administrateur'

class ChefServiceRestaurant(PersonnelRestaurant):
    class Meta:
        db_table = 'chefservicerestaurant'

class Magasinier(PersonnelRestaurant):
    class Meta:
        db_table = 'magasinier'

class VendeurTicket(PersonnelRestaurant):
    class Meta:
        db_table = 'vendeurticket'

class ResponsableGuichet(PersonnelRestaurant):
    class Meta:
        db_table = 'responsableguichet'
