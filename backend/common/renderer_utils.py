from rest_framework.renderers import JSONRenderer
from rest_framework.utils.serializer_helpers import ReturnList, ReturnDict


class CustomJSONRenderer(JSONRenderer):
    charset = 'utf-8'

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response")
        request = renderer_context.get("request")
        view = renderer_context.get("view")

        # If already shaped as error response, pass through
        if isinstance(data, dict) and data.get("success") is False:
            return super().render(data, accepted_media_type, renderer_context)

        # Detect method
        method = request.method if request else "GET"

        # Get resource name from view
        resource_name = getattr(view, "resource_name", "Resource") if view else "Resource"

        # Smart message
        action_message = {
            "GET": f"{resource_name} fetched successfully",
            "POST": f"{resource_name} created successfully",
            "PUT": f"{resource_name} updated successfully",
            "PATCH": f"{resource_name} partially updated successfully",
            "DELETE": f"{resource_name} deleted successfully",
        }.get(method, "Success")

        # Allow message override
        message_key = getattr(view, "message_key", "message") if view else "message"

        message = data.pop(message_key, action_message) if isinstance(data, dict) else action_message

        return super().render({
            "success": True,
            "message": message,
            "data": data if isinstance(data, (dict, list, ReturnList, ReturnDict)) else {}
        }, accepted_media_type, renderer_context)
