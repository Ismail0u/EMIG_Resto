# monapp/models/utilisateur.py
from django.utils import timezone
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UtilisateurManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("L'adresse e-mail est obligatoire")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Django gère le hash ici
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', "ADMIN")
        return self.create_user(email, password, **extra_fields)


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, max_length=100)
    nom = models.CharField(max_length=50)
    prenom = models.CharField(max_length=50)
    telephone = models.CharField(max_length=20, blank=True, null=True)
    role = models.CharField(
        max_length=30,
        choices=[
            ("ETUDIANT", "Étudiant"),
            ("ADMIN", "Administrateur"),
            ("CHEF_SERVICE", "Chef Service Restaurant"),
            ("MAGASINIER", "Magasinier"),
            ("VENDEUR_TICKETS", "Vendeur Tickets"),
            ("RESPONSABLE_GUICHET", "Responsable Guichet"),
            ("CUISINIER", "Cuisinier"),
        ],
    )
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom']

    objects = UtilisateurManager()

    def get_full_name(self):
        return f"{self.nom} {self.prenom}"

    def get_short_name(self):
        return self.prenom

    def __str__(self):
        return self.email

    @property
    def as_etudiant(self):
        # Import Etudiant locally to avoid circular imports, but only when needed.
        # This is a common pattern for related models.
        from monapp.models.etudiant import Etudiant

        # Check if the user's role is 'ETUDIANT' first
        if self.role == "ETUDIANT": #
            try:
                # Attempt to retrieve the related Etudiant object.
                # Assuming 'etudiant' is the default related_name or explicitly set as such
                # if Etudiant has a OneToOneField like:
                # utilisateur = models.OneToOneField(Utilisateur, on_delete=models.CASCADE, related_name='etudiant')
                return self.etudiant
            except Etudiant.DoesNotExist:
                # If the role is 'ETUDIANT' but no Etudiant profile exists, raise a specific error
                raise ValueError("L'utilisateur est marqué comme étudiant mais n'a pas de profil étudiant associé.")
        else:
            # If the user's role is not 'ETUDIANT', then they are not an etudiant.
            raise ValueError("Cet utilisateur n'est pas un étudiant.")

    class Meta:
        verbose_name = "Utilisateur"
        verbose_name_plural = "Utilisateurs"
        db_table = 'utilisateur'