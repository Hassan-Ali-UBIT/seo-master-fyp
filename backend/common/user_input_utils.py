
def validate_required_data(request, required_fields):
    # Indicates if any required fields are missing
    has_error = False

    # Dictionary to hold error messages for missing fields
    missing_fields = {}

    # Dictionary to store values of the provided required fields
    provided_data = {}
    
    for field in required_fields:

        formatter = None
        if isinstance(field, tuple):
            formatter = field[-1]
            field = field[0]

        field_value = request.data.get(field)
        if field_value is None:
            # If field is missing, add an error message
            missing_fields[field] = "This field is required"
            has_error = True
        else:
            # Otherwise, add the field's value to provided_data
            if formatter:
                try:
                    provided_data[field] = formatter(field_value)
                except:
                    has_error = True
                    missing_fields[field] = "Invalid Format was passed"
            else:
                provided_data[field] = field_value
    
    # Return the provided data, error status, and any missing fields with error messages
    return (provided_data, has_error, missing_fields)

# def validate():
