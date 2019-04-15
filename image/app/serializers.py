from rest_framework import serializers
from .models import Image


class ImageSerializer(serializers.ModelSerializer):
    image_name = serializers.CharField(source='name', allow_null=False)
    description = serializers.CharField(allow_null=False)
    image = serializers.ImageField(allow_empty_file=False, read_only=False)

    class Meta:
        model = Image
        fields = ('image_name', 'description', 'image')

