from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from ..models.etudiant import Etudiant

class UserDetailsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response(
                {"detail": "Authentification requise."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        data = {
            "id": user.id,
            "email": user.email,
            "prenom": getattr(user, 'prenom', '') or getattr(user, 'first_name', ''),
            "nom":    getattr(user, 'nom', '') or getattr(user, 'last_name', ''),
            "solde": float(getattr(user, 'solde', 0.0)),
        }

        # 🔥 Ici on va récupérer les quotas depuis l'étudiant lié
        try:
            etu = user.etudiant  # si tu as bien une OneToOneField ou FK Utilisateur → Etudiant
            data["ticket_quota_80"]  = etu.ticket_quota_80
            data["ticket_quota_125"] = etu.ticket_quota_125
            data["nombre_tickets"]   = etu.ticket_quota_80 + etu.ticket_quota_125
        except Etudiant.DoesNotExist:
            # si ce n'est pas un étudiant, on met 0 par défaut
            data["ticket_quota_80"]  = 0
            data["ticket_quota_125"] = 0
            data["nombre_tickets"]   = 0

        return Response(data, status=status.HTTP_200_OK)
