from django.db import IntegrityError
from rest_framework.serializers import ValidationError
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from .serializers import ImageSerializer
from .models import Image
from .constants import STANDARD_SIZE
from .resources import validate_new_image, push_to_s3, async_upload_image


class ImageViewSet(viewsets.ModelViewSet):

    queryset = Image.objects.all()
    serializer_class = ImageSerializer

    def create(self, request, *args, **kwargs):
        # make a log of the method call with request data and unique id as information tag
        response = {
            'message': '',
            'success': False,
        }
        data = request.data
        image = response.get('File')
        try:
            is_valid = validate_new_image(image)
            if not is_valid:
                response['message'] = 'Invalid image size'
                response['error'] = '%s %s' % ('Provide valid size', STANDARD_SIZE)
                return Response(response, status=status.HTTP_400_BAD_REQUEST)
            image_url = push_to_s3(image)
            data['horizontal_image'] = image_url
            serializer = ImageSerializer(data=data)
            if not serializer.is_valid():
                response['errors'] = serializer.errors
                raise ValidationError(response)
            serializer.save()
            obj = serializer.instance
            async_upload_image.apply_async(args=(obj, image))

        except IntegrityError as i_err:
            # make a log in the logging system with critical tag
            response['message'] = 'Unable to save Data'
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except ValidationError as v_err:
            # log the data in the logging system
            return Response(v_err.detail, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            # log in the logging system marking as critical tag
            response['message'] = 'Some error occured'
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(response, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        response = {
            'message': '',
            'success': False,
            'data': []
        }
        # make a log of the method call with request data and unique id as information tag
        data = request.data
        pk = kwargs.get('pk')
        try:

            image = response.get('Files')
            if image:
                is_valid = validate_new_image(image)
                if not is_valid:
                    response['message'] = 'Invalid Image'
                    response['error'] = '%s %s' % ('Provide valid size', STANDARD_SIZE)
                    raise ValidationError(response)
                image_url = push_to_s3(image)
                data['horizontal_image'] = image_url
            obj = Image.objects.filter(pk = pk).first()
            serializer = ImageSerializer(instance=obj, data=data, partial=True)
            serializer.save()
            # start a async to make new different type of image and put in s3
            async_upload_image.apply_async(obj, image)

        except IntegrityError as i_err:
            # make a log in the logging system with critical tag
            response['message'] = 'Unable to Update Data'
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except ValidationError as v_err:
            # log the data in the logging system
            return Response(v_err.detail, status=status.HTTP_400_BAD_REQUEST)

        except Exception as exc:
            # log in the logging system marking as critical tag
            response['message'] = 'Some error occured'
            return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(response, status=status.HTTP_200_OK)

    def retrieve(self, request, *args, **kwargs):
        response = {
            'message': '',
            'data': [],
            'success': False
        }
        #
        pk = kwargs.get('pk', None)
        # make a log of the method call with request data and unique id as information tag
        if not pk:
            return Response('Provide id to get data', status=status.HTTP_200_OK)
        instance_obj = Image.object.filter(pk=pk).first()
        serializer = ImageSerializer(instance=instance_obj)
        response['data'] = serializer.data
        if response['data']:
            response['message'] = 'Data retrievied Successfully'
            response['success'] = True
        return Response(response, status=status.HTTP_200_OK)

