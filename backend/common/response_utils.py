from typing import Optional

from rest_framework import status
from rest_framework.response import Response


def error_response(code:str,message:str, missing_field:Optional[dict[str, str]]=None, status_code=status.HTTP_400_BAD_REQUEST):
    data = {
        "error": {
            "code": code,
            "message": message,
            "details": None
        }
    }

    if missing_field is not None:
        data["error"]["details"] = missing_field

    return Response(data, status=status_code)

def success_response(data=None,message=None,success=True,status_code=status.HTTP_200_OK):
    response_data = {
        "success":success,
        "message":message,
        "data":data
    }

    return Response(response_data,status_code)
