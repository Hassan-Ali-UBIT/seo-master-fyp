
def apply_ordering(request, queryset, order_fields, default_ordering:list=None):

    ordering = request.query_params.get('ordering', None)
    ordering_fields = []
    if default_ordering is not None and ordering is None:
        ordering_fields.extend(default_ordering)

    if ordering:
        for field in ordering.split(','):
            field = field.strip()
            if field.startswith('-'):
                field_name = field[1:]
                if field_name in order_fields:
                    ordering_fields.append(f"-{order_fields[field_name]}")
            else:
                if field in order_fields:
                    ordering_fields.append(order_fields[field])

    if ordering_fields:
        queryset = queryset.order_by(*ordering_fields)

    return queryset