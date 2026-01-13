import calendar
from datetime import datetime
from django.db.models import Func
from math import radians, sin, cos, sqrt, atan2


class Distance(Func):
    function = 'ACOS'
    # Updated template to receive lat and lon as parameters in `Distance`
    template = ('DEGREES(ACOS(SIN(RADIANS(%(user_lat)s)) * SIN(RADIANS(latitude)) '
                '+ COS(RADIANS(%(user_lat)s)) * COS(RADIANS(latitude)) * '
                'COS(RADIANS(longitude) - RADIANS(%(user_lon)s))))')

    def __init__(self, user_lat, user_lon, **extra):
        # Passing user_lat and user_lon as named parameters for template substitution
        super().__init__(user_lat=user_lat, user_lon=user_lon, **extra)


def is_valid_date(date_string, date_format="%Y-%m-%d"):

    possible_formats = [
        "%Y-%m-%d",     # ISO format
        "%d/%m/%Y",     # Custom format (day/month/year)
        "%m/%d/%Y",     # Another custom format (month/day/year)
    ]

    for format in possible_formats:
        try:
            # Try to parse the date using the current format
            datetime.strptime(date_string, format)
            return True
        except ValueError:
            # If parsing fails, move to the next format
            continue
    return False

def parse_date(date_string):
    # List of possible date formats
    possible_formats = [
        "%Y-%m-%d",     # ISO format
        "%d/%m/%Y",     # Custom format (day/month/year)
        "%m/%d/%Y",     # Another custom format (month/day/year)
    ]

    for date_format in possible_formats:
        try:
            # Try to parse the date using the current format
            date_obj = datetime.strptime(date_string, date_format)
            return date_obj
        except ValueError:
            # If parsing fails, move to the next format
            continue

    # If none of the formats work, raise an error
    raise ValueError("Date format not recognized")

def str_to_time(time_string):

    possible_formats = [
        "%H:%M:%S",     # 24-hour format with seconds
        "%H:%M",        # 24-hour format without seconds
        "%I:%M %p",     # 12-hour format with AM/PM
        "%I:%M:%S %p"   # 12-hour format with seconds and AM/PM
    ]

    for time_format in possible_formats:
        try:
            # Try to parse the date using the current format
            time_obj = datetime.strptime(time_string, time_format)
            return time_obj.time()
        except ValueError:
            # If parsing fails, move to the next format
            continue
    
    raise ValueError("Invalid time format was passed")

def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radius of Earth in kilometers
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

def parse_european_date_format(date_string, required_format="%d-%m-%Y"):
    date_obj = datetime.strptime(date_string, required_format)
    return date_obj

def parse_international_date_format(date_string):
    return datetime.strptime(date_string, "%Y-%m-%d")

def get_weekday_name(day_id):
    weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

    return weekdays[day_id]

def get_month_name(month_id):
    return calendar.month_name[month_id]
