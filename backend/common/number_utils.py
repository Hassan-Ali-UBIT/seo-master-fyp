import re

def format_number(number):
    number = "{:,.2f}".format(number or 0)
    number = number if number != "0.00" else ""
    return number

def format_number_with_zero(number):
    return "{:,.2f}".format(number or 0)


def extract_number(value):
    match = re.search(r'\d+', value)
    number = "---"
    if match:
        number = int(match.group())
    return number