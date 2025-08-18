from django.shortcuts import get_object_or_404
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.status import HTTP_400_BAD_REQUEST
from .serializers import *


@api_view(['GET'])
def test(request):
    return Response({"message": "All's right"}, status=status.HTTP_200_OK)
