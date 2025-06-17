# create_etudiants.py
from django.utils import timezone
from monapp.models import Etudiant

# Génération de 25 étudiants fictifs avec des prénoms et noms nigériens
etudiants_data = [
    {"email": "amadou@example.com", "nom": "Oumarou", "prenom": "Amadou", "matricule": "NR2023001", "genre": "M"},
    {"email": "aissata@example.com", "nom": "Moussa", "prenom": "Aïssata", "matricule": "NR2023002", "genre": "F"},
    {"email": "ibrahim@example.com", "nom": "Maïga", "prenom": "Ibrahim", "matricule": "NR2023003", "genre": "M"},
    {"email": "fatimata@example.com", "nom": "Hassane", "prenom": "Fatimata", "matricule": "NR2023004", "genre": "F"},
    {"email": "salif@example.com", "nom": "Alidou", "prenom": "Salif", "matricule": "NR2023005", "genre": "M"},
    {"email": "haba@example.com", "nom": "Issoufou", "prenom": "Haba", "matricule": "NR2023006", "genre": "F"},
    {"email": "moussa@example.com", "nom": "Zanfani", "prenom": "Moussa", "matricule": "NR2023007", "genre": "M"},
    {"email": "koumba@example.com", "nom": "Salifou", "prenom": "Koumba", "matricule": "NR2023008", "genre": "F"},
    {"email": "harouna@example.com", "nom": "Tandja", "prenom": "Harouna", "matricule": "NR2023009", "genre": "M"},
    {"email": "ramatou@example.com", "nom": "Traoré", "prenom": "Ramatou", "matricule": "NR2023010", "genre": "F"},
    {"email": "niass@example.com", "nom": "Diori", "prenom": "Niass", "matricule": "NR2023011", "genre": "M"},
    {"email": "adiza@example.com", "nom": "Tilho", "prenom": "Adiza", "matricule": "NR2023012", "genre": "F"},
    {"email": "mamadou@example.com", "nom": "Djibo", "prenom": "Mamadou", "matricule": "NR2023013", "genre": "M"},
    {"email": "binta@example.com", "nom": "Abaré", "prenom": "Binta", "matricule": "NR2023014", "genre": "F"},
    {"email": "souley@example.com", "nom": "Soumana", "prenom": "Souley", "matricule": "NR2023015", "genre": "M"},
    {"email": "halimatou@example.com", "nom": "Harouna", "prenom": "Halimatou", "matricule": "NR2023016", "genre": "F"},
    {"email": "youssouf@example.com", "nom": "Boubacar", "prenom": "Youssouf", "matricule": "NR2023017", "genre": "M"},
    {"email": "ramatu@example.com", "nom": "Adamou", "prenom": "Ramatu", "matricule": "NR2023018", "genre": "F"},
    {"email": "mohamed@example.com", "nom": "Ould Cheikh", "prenom": "Mohamed", "matricule": "NR2023019", "genre": "M"},
    {"email": "sani@example.com", "nom": "Sanogo", "prenom": "Sani", "matricule": "NR2023020", "genre": "M"},
    {"email": "amina@example.com", "nom": "Challal", "prenom": "Amina", "matricule": "NR2023021", "genre": "F"},
    {"email": "brahim@example.com", "nom": "Ousmane", "prenom": "Brahim", "matricule": "NR2023022", "genre": "M"},
    {"email": "kadiatou@example.com", "nom": "Kareem", "prenom": "Kadiatou", "matricule": "NR2023023", "genre": "F"},
    {"email": "lazare@example.com", "nom": "Issa", "prenom": "Lazare", "matricule": "NR2023024", "genre": "M"},
    {"email": "fati@example.com", "nom": "Zahra", "prenom": "Fati", "matricule": "NR2023025", "genre": "F"},
]

for data in etudiants_data:
    etu, created = Etudiant.objects.get_or_create(
        email=data["email"],
        defaults={
            "nom": data["nom"],
            "prenom": data["prenom"],
            "matricule": data["matricule"],
            "genre": data["genre"],
            "date_joined": timezone.now(),
        }
    )
    if created:
        etu.set_password("default1234")  # ⚠️ Changer ce mot de passe par défaut
        etu.save()
        print(f"✅ Étudiant {etu.get_full_name()} créé avec succès.")
    else:
        print(f"ℹ️ Étudiant {etu.get_full_name()} existe déjà.")
