
"""

This file contains all the resources and helper functions required for the application

"""

from django.conf import settings
from app.utils.cloud_storage import S3Upload
from app.constants import S3_MESSAGE
from .serializers import ImageSerializer
from .constants import IMAGE_CONFIGURATION, STANDARD_PIXEL
import PIL
from PIL import Image


def resize_image(image, base_width, base_height):
    img = Image.open(image)
    width_percent = base_width / float(img.size[0])
    height_percent = base_height / float(img.size[1])
    img = img.resize(width_percent, height_percent, PIL.Image.ANTIALIAS)
    img.save()
    return img


def validate_new_image(image):
    """
    This method validates the size of the image in size '1024 x 1024' using pillow
    :param image:django in-memory content object
    :return: boolean True on success
    """
    im = Image.open(image)
    width, height = im.size
    if width == height and height == STANDARD_PIXEL:
        return True
    return False


def create_new_images(image):
    """

    :param image:
    :return:
    """
    images = []
    for k, v in IMAGE_CONFIGURATION.items():
        temp = image.copy()
        images.append(resize_image(temp, v.get('width'), v.get('height')))
    return images


def push_to_s3(image):
    """
    this method helps in pushing the image to the s3 and get the url back from s3
    :param image:
    :return: dict containing two keys url and success
    """
    response = {
        'success': False,
        'url': ''

    }
    ext = image.name.split('.')[1]
    accepted_img_type = ', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)
    if ext in accepted_img_type:
        s3 = S3Upload()
        s3_response = s3.upload(image, params={'bucket_key': 'mdb-ibcdn-com'})
        if s3_response['success']:
            s3_image_url = s3_response['data']
            response['url'] = s3_image_url
            response['success'] = True
        else:
            raise Exception('Error occured while S3 upload')
    else:
        raise Exception(S3_MESSAGE.get('IMAGE_FORMAT'))
    return response


def async_upload_image(obj, image):
    """
    this method is celery linked which runs on async to create 3 different image of different dimensions
    and then push it to s3 and update it to the obj.
    :param obj:
    :param image:
    :return:
    """
    validate_new_image(image)
    images = create_new_images(image)
    results = []
    for image in images:
        temp_response = push_to_s3(image).get('urls')
        url = temp_response.get('url')
        results.append(url)
    data = {
        'vertical_image': results[0],
        'horizontal_small_image': results[1],
        'gallery': results[2]
    }
    serializer = ImageSerializer(instance=obj, data=data, partial=True)
    if serializer.is_valid():
        serializer.save()

