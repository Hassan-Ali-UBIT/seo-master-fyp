from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.exceptions import NotFound


class CustomPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100
    page_query_param = "page"

    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view=view)
        except NotFound:
            # Return an empty list if the page is out of range
            self.page = None
            return []

    def get_paginated_response(self, data):
        if not data:
            # Return an empty list response if there are no results for the page
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': []
            })
        return super().get_paginated_response(data)

def get_pagination_response(request, queryset, serializer = None):
    
    pagination = CustomPagination()

    paginated_data = pagination.paginate_queryset(queryset, request)

    if serializer is not None:
        paginated_data = serializer(paginated_data, many=True).data

    return pagination.get_paginated_response(paginated_data)

def get_manual_pagination_response(request, response_list, page_size = 10, max_count = None):

    page = request.query_params.get("page", 1)
    page_size = request.query_params.get("page_size", page_size)

    start = (page - 1) * page_size
    end = start + page_size

    response_list_length = max(len(response_list), max_count or 0)
    response_list = response_list[start:end]

    prev_url = ""
    next_url = ""

    if response_list_length > page * 10:
        next_url = request.build_absolute_uri('?page=' + f'{page+1}')
    if page > 1:
        prev_url = request.build_absolute_uri(f'?page={page-1}')

    response_data = {
        "count": response_list_length,
        "next": next_url,
        "previous": prev_url,
        "result": response_list
    }

    return response_data



