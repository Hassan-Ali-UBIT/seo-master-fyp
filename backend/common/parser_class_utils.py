import json
from io import BytesIO

from django.http import QueryDict
from django.utils.datastructures import MultiValueDict
from django.core.files.uploadhandler import MemoryFileUploadHandler, TemporaryFileUploadHandler
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile

from rest_framework.parsers import BaseParser
from rest_framework.exceptions import ParseError

class FormDataParser(BaseParser):
    media_type = "multipart/form-data"

    def is_json_parsable(self, value: str) -> bool:
        if not isinstance(value, str):
            return False
        value = value.strip()
        return (value.startswith("{") or value.startswith("[")) and self._is_valid_json(value)

    def _is_valid_json(self, value: str) -> bool:
        try:
            json.loads(value)
            return True
        except json.JSONDecodeError:
            return False

    def parse(self, stream: BytesIO, media_type: str = None, parser_context: dict = None):
        parser_context = parser_context or {}
        request = parser_context.get("request")

        request.upload_handlers = [
            MemoryFileUploadHandler(request),
            TemporaryFileUploadHandler(request),
        ]

        try:
            data, files = request.parse_file_upload(request.META, stream)
        except Exception as exc:
            raise ParseError(f"Failed to parse multipart/form-data: {str(exc)}")
        
        # Get the view instance from parser_context (provided by DRF)
        view = parser_context.get("view")
        # Access json_excluded_fields from the view, default to empty list if not defined
        excluded_fields = getattr(view, "json_excluded_fields", [])



        flat_data = QueryDict(mutable=True)

        for key in data:
            values = data.getlist(key)
            parsed_values = []

            # Check if the current key is in excluded_fields
            should_parse_json = key not in excluded_fields
            
            for value in values:
                if should_parse_json and self.is_json_parsable(value):
                    try:
                        parsed = json.loads(value)
                        # Handle JSON arrays by flattening them
                        if isinstance(parsed, list) and not isinstance(parsed[0], dict):
                            parsed_values.extend(parsed)
                        else:
                            parsed_values.append(parsed)
                    except Exception:
                        parsed_values.append(value)
                else:
                    parsed_values.append(value)
            
            # Always use setlist to maintain proper value structure
            flat_data.setlist(key, parsed_values)

        # Handle files separately
        for key in files:
            flat_data.setlist(key, files.getlist(key))

        return flat_data