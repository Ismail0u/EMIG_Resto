from rest_framework import viewsets
from ..models.personnel import (
    Administrateur, ChefServiceRestaurant, Magasinier,
    VendeurTicket, ResponsableGuichet
)
from ..serializers.personnel_serializer import (
    ChefServiceSerializer, MagasinierSerializer,
    VendeurTicketsSerializer, ResponsableGuichetSerializer,
    AdministrateurSerializer
)

class ChefServiceRestaurantViewSet(viewsets.ModelViewSet):
    queryset = ChefServiceRestaurant.objects.all()
    serializer_class = ChefServiceSerializer


class MagasinierViewSet(viewsets.ModelViewSet):
    queryset = Magasinier.objects.all()
    serializer_class = MagasinierSerializer


class VendeurTicketsViewSet(viewsets.ModelViewSet):
    queryset = VendeurTicket.objects.all()
    serializer_class = VendeurTicketsSerializer


class ResponsableGuichetViewSet(viewsets.ModelViewSet):
    queryset = ResponsableGuichet.objects.all()
    serializer_class = ResponsableGuichetSerializer


class AdministrateurViewSet(viewsets.ModelViewSet):
    queryset = Administrateur.objects.all()
    serializer_class = AdministrateurSerializer
