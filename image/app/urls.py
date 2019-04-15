
from .views import ImageViewSet

from django.conf import settings
from django.conf.urls import static
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'photo', ImageViewSet, 'Image')

urlpatterns = router.urls
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
