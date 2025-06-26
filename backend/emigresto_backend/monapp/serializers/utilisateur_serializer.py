# monapp/serializers/utilisateur_serializer.py
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UtilisateurSerializer(serializers.ModelSerializer):
    # On autorise le champ "telephone" à arriver (pas stocké sur le User)
    telephone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'nom',
            'prenom',
            'password',
            'role',
            'date_joined',
            'telephone',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        # Retirer le telephone pour éviter une erreur
        validated_data.pop('telephone', None)
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user
