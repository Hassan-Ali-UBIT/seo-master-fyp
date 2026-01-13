from typing import Optional
from datetime import datetime

from django.db.models import Q, Case, When, F, Value, FloatField, CharField
from django.db.models.functions import Concat, Cast, Round
from django.core.exceptions import ValidationError
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.contrib.gis.db.models.functions import Distance

from .exception_utils import CustomAPIException

def apply_filter(request, queryset, filter_lookup:dict,
                 defaults: Optional[dict] = None,
                 required_filter: Optional[set] = None) -> tuple:

    applied_filters = []
    filter_errors = {}
    has_missing_or_incorrect_filter = False

    for param, lookup in filter_lookup.items():
        value = request.query_params.get(param)
        if value:
            try:
                if isinstance(lookup, tuple):
                    formatter = lookup[1]
                    lookup = lookup[0]
                    queryset = queryset.filter(**{lookup: formatter(value)})
                else:
                    queryset = queryset.filter(**{lookup: value})
                applied_filters.append(f"{param.replace('_', ' ').capitalize()}: {value}")
            except (ValidationError, ValueError):
                filter_errors[param] = "Incorrect Format was passed."
                has_missing_or_incorrect_filter = True

        elif defaults and param in defaults:
            try:
                cur_val = defaults[param]
                queryset = queryset.filter(**{lookup: cur_val})
                applied_filters.append(f"{param.replace('_', ' ').capitalize()}: {cur_val}")
            except (ValidationError, ValueError):
                filter_errors[param] = "Incorrect Format was passed."
                has_missing_or_incorrect_filter = True

        elif  required_filter and param in required_filter:
            filter_errors[param] = "This filter is required"
            has_missing_or_incorrect_filter = True

    if has_missing_or_incorrect_filter:
        raise CustomAPIException(
            "Required filters are missing or incorrectly formatted.",
            data=filter_errors
        )

    return (queryset, applied_filters)

def apply_query_filter(request, queryset, lookups):

    query = request.query_params.get("search")

    fil = Q()

    for lookup in lookups:
        fil |= Q(**{lookup: query})

    try:

        if query is not None:
            queryset = queryset.filter(fil)

            queryset = queryset.distinct()


    except Exception as e:
        raise CustomAPIException(
            "Invalid search query format.",
            data={"search": str(e)}
        )

    return queryset

def validate_required_filter_in_request(request, filters_to_check:list, error_messages:dict = None):

    are_all_filter_values_provided = True
    incorrect_filter_format = False
    filter_errors = {}
    filter_values = {}

    for filter in filters_to_check:
        required_filter = filter
        filter_formatter = None

        if isinstance(filter, tuple):
            required_filter = filter[0]
            filter_formatter = filter[1]

        filter_value = request.query_params.get(required_filter)

        if filter_value is None:
            filter_errors[required_filter] = "This filter is required"
            are_all_filter_values_provided = False
        else:
            if filter_formatter:
                try:
                    actual_filter_value = filter_formatter(filter_value)
                    filter_values[required_filter] = actual_filter_value
                except:
                    incorrect_filter_format = True
                    if error_messages and required_filter in error_messages:
                        filter_errors[required_filter] = error_messages[required_filter]
                    else:
                        filter_errors[required_filter] = "Incorrect Format was provided"
            else:
                filter_values[required_filter] = filter_value

    if not are_all_filter_values_provided or incorrect_filter_format:
        raise CustomAPIException(
            "Required filters are missing or incorrectly formatted.",
            data=filter_errors
        )

    return filter_values

def valid_date(date_str: str) -> bool:
    """Check if the date string is in valid format YYYY-MM-DD."""
    datetime.strptime(date_str, "%Y-%m-%d")

def apply_distance_query(longitude, latitude, queryset, distance=5, distance_field='location'):
    """
    Apply distance filter to the queryset based on longitude and latitude.
    :param longitude: Longitude of the point.
    :param latitude: Latitude of the point.
    :param queryset: The queryset to filter.
    :param distance: Distance in kilometers (default is 5 km).
    :return: Filtered queryset.
    """
    if not longitude or not latitude:
        raise CustomAPIException("Longitude and latitude are required for distance filtering.")

    point = Point(float(longitude), float(latitude), srid=4326)
    distance_lookup = f"{distance_field}__distance_lte"

    return queryset.filter(**{
        distance_lookup: (point, D(km=distance))
    }).annotate(
        raw_distance=Distance(distance_field, point),
        distance=Concat(
            Cast(
                Round(
                    Case(
                        When(raw_distance__lt=1000, then=F('raw_distance')),
                        default=F('raw_distance') / 1000,
                        output_field=FloatField()
                    ),
                    2
                ),
                output_field=CharField()
            ),
            Value(' '),
            Case(
                When(raw_distance__lt=1000, then=Value('m')),
                default=Value('km'),
                output_field=CharField()
            ),
            output_field=CharField()
        )
    ).order_by('distance')

def convert_str_to_bool(value: str) -> bool:
    """Convert string representation of boolean to actual boolean."""
    if isinstance(value, bool):
        return value

    true_values = {'true', '1', 't', 'yes', 'y'}
    false_values = {'false', '0', 'f', 'no', 'n'}

    value_lower = value.lower()
    if value_lower in true_values:
        return True
    elif value_lower in false_values:
        return False
    else:
        raise CustomAPIException(f"Cannot convert {value} to boolean.")

