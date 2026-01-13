

from rest_framework.validators import UniqueValidator

class ConditionalUniqueValidator(UniqueValidator):
    def __call__(self, value, serializer_field):
        # Get the serializer instance
        serializer = serializer_field.parent
        # Get the instance ID from the context or initial data
        instance_id = serializer.initial_data.get('id')

        # Skip validation if an ID is provided (i.e., during updates)
        if instance_id:
            return

        # Run the default UniqueValidator logic
        super().__call__(value, serializer_field)

    