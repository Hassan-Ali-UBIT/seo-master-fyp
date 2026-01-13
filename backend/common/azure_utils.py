import os
import re
import uuid
import urllib.parse

from azure.storage.blob import BlobServiceClient, ContainerClient, PublicAccess
from azure.core.exceptions import ResourceNotFoundError

from django.conf import settings
from django.core.validators import FileExtensionValidator

from rest_framework import serializers
# BASE_AZURE_STORAGE_LINK = f"{settings.AZURE_BLOB_URI}{settings.AZURE_CONTAINER_NAME}/"

# def standard_url(file_name):
#     return urllib.parse.quote(file_name, safe="")

# def upload_file_to_azure(file_name, file_content):

#     block_blob_service = BlobServiceClient.from_connection_string(conn_str=settings.AZURE_BLOB_CONNECTION_STRING)
#     container_client = block_blob_service.get_container_client(container=settings.AZURE_CONTAINER_NAME)
#     container_client.upload_blob(name=file_name, data=file_content.read())


# def create_azure_storage_link(file_name):

#     return BASE_AZURE_STORAGE_LINK + standard_url(file_name)

BASE_AZURE_STORAGE_LINK = f"{settings.AZURE_BLOB_URI}{settings.AZURE_CONTAINER_NAME}/"

def standard_url(file_name: str) -> str:
    """Safely encode the file name for a valid Azure Blob URL."""
    return urllib.parse.quote(file_name, safe="")

def create_azure_storage_link(file_name: str) -> str:
    """Generate the full public URL of the file on Azure Blob Storage."""
    return BASE_AZURE_STORAGE_LINK + standard_url(file_name)

def sanitize_blob_name(file_name: str) -> str:
    """Ensure the blob name complies with Azure Blob Storage naming rules."""
    safe_name = re.sub(r'[^a-z0-9.-]', '', file_name.lower())
    safe_name = re.sub(r'[.-]{2,}', '.', safe_name)
    safe_name = safe_name.strip('.-')
    return safe_name

def validate_container_name(container_name: str) -> None:
    """Validate the Azure container name."""
    if not (3 <= len(container_name) <= 63):
        raise ValueError(f"Container name '{container_name}' must be 3-63 characters long.")
    if not re.match(r'^[a-z0-9][a-z0-9-]*[a-z0-9]$', container_name):
        raise ValueError(f"Container name '{container_name}' must contain only lowercase letters, numbers, and hyphens, and start/end with a letter or number.")

def generate_unique_filename(original_filename: str) -> str:
    """Generate a safe UUID-based file name with original filename and sanitized extension."""
    # Get the base name and extension from the original filename
    base_name = os.path.splitext(original_filename)[0]
    ext = os.path.splitext(original_filename)[1].lower()
    
    # Sanitize the base name (remove invalid characters and limit length)
    safe_base = re.sub(r'[^a-z0-9-]', '', base_name.lower())
    # Limit base name length to avoid exceeding Azure's 1024 character limit
    # Accounting for UUID (32 chars) and extension
    max_base_length = 50
    safe_base = safe_base[:max_base_length]
    
    # Sanitize the extension
    safe_ext = re.sub(r'[^a-z0-9.]', '', ext)
    if not safe_ext.startswith('.'):
        safe_ext = f'.{safe_ext}'
    if safe_ext == '.' or len(safe_ext) > 10:
        safe_ext = '.bin'
    
    # Generate UUID and combine with original name
    uuid_part = uuid.uuid4().hex
    file_name = f"{safe_base}---{uuid_part}{safe_ext}"
    
    return file_name

def delete_container(blob_service_client, container_name: str) -> bool:
    """
    Delete an existing container if it exists.
    
    Args:
        blob_service_client: Initialized BlobServiceClient instance.
        container_name: Name of the container to delete.
    
    Returns:
        bool: True if deleted successfully or didn't exist, False if deletion failed.
    """
    try:
        container_client = blob_service_client.get_container_client(container_name)
        if container_client.exists():
            print(f"Deleting existing container: {container_name}")
            container_client.delete_container()
            print(f"Container {container_name} deleted successfully")
        else:
            print(f"Container {container_name} does not exist")
        return True
    except Exception as e:
        print(f"Failed to delete container {container_name}: {str(e)}")
        return False

def get_or_create_container(blob_service_client, container_name: str, public_access: str = 'private') -> ContainerClient:
    """
    Get a container client, creating the container if it doesn't exist with specified access level.
    
    Args:
        blob_service_client: Initialized BlobServiceClient instance.
        container_name: Name of the container to get or create.
        public_access: 'public' for blob-level public access, 'private' for private access (default).
    
    Returns:
        ContainerClient instance for the specified container.
    """
    container_client = blob_service_client.get_container_client(container_name)
    try:
        container_client.get_container_properties()
        print("Container already exists:", repr(container_name))
    except ResourceNotFoundError:
        print("Container does not exist, creating it:", repr(container_name))
        # Set access level based on parameter
        access_level = PublicAccess.BLOB if public_access.lower() == 'public' else None
        container_client.create_container(public_access=access_level)
        access_type = "public" if access_level else "private"
        print(f"Container created successfully with {access_type} access:", repr(container_name))
    return container_client

def upload_file_to_azure(original_filename: str, file_content) -> str:
    """Uploads a file to Azure Blob Storage with a unique name and returns the file URL."""
    try:
        # Generate and validate file name
        file_name = generate_unique_filename(original_filename)
        print("Generated blob name:", repr(file_name))
        print("Original filename:", repr(original_filename))

        # Validate container name
        container_name = settings.AZURE_CONTAINER_NAME
        validate_container_name(container_name)
        print("Using container name:", repr(container_name))

        # Initialize Azure clients
        blob_service_client = BlobServiceClient.from_connection_string(
            conn_str=settings.AZURE_BLOB_CONNECTION_STRING
        )
        
        # Get or create the container with specified access
        container_client = get_or_create_container(blob_service_client, container_name, 'public')
        
        blob_client = container_client.get_blob_client(file_name)

        # Verify blob name just before upload
        print("Final blob name for upload:", repr(blob_client.blob_name))
        print("Uploading to Azure...")

        # Upload the file
        blob_client.upload_blob(data=file_content, overwrite=True)
        print("Upload successful!")

        return create_azure_storage_link(file_name)

    except Exception as e:
        print("Upload failed with error:", str(e))
        raise Exception(f"Azure upload failed: {str(e)}")

def delete_file_from_azure(file_url: str) -> bool:
    """
    Delete a file from Azure Blob Storage given its URL.
    
    Args:
        file_url: The full URL of the file in Azure Blob Storage.
    
    Returns:
        bool: True if deletion was successful or file didn't exist, False if failed.
    
    Raises:
        ValueError: If the URL format is invalid or doesn't match expected pattern.
    """
    try:
        # Extract blob name from URL
        if not file_url.startswith(BASE_AZURE_STORAGE_LINK):
            raise ValueError(f"Invalid Azure Blob URL: {file_url}")
        
        blob_name = urllib.parse.unquote(file_url[len(BASE_AZURE_STORAGE_LINK):])
        
        # Initialize Azure clients
        blob_service_client = BlobServiceClient.from_connection_string(
            conn_str=settings.AZURE_BLOB_CONNECTION_STRING
        )
        
        # Validate container name
        container_name = settings.AZURE_CONTAINER_NAME
        validate_container_name(container_name)
        
        # Get container client
        container_client = blob_service_client.get_container_client(container_name)
        
        # Get blob client and delete
        blob_client = container_client.get_blob_client(blob_name)
        
        if blob_client.exists():
            blob_client.delete_blob()
            print(f"Successfully deleted blob: {blob_name}")
        else:
            print(f"Blob does not exist: {blob_name}")
        
        return True
    
    except Exception as e:
        print(f"Failed to delete file from Azure: {str(e)}")
        return False

class AzureUploadSerializer(serializers.Field):
    """
    A custom field for uploading files or images to Azure Blob Storage directly.
    Expects the binary file content as the value.
    """
    IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'] + IMAGE_EXTENSIONS

    def __init__(self, field_type='file', public_access='private', max_size_mb=10, **kwargs):
        super().__init__(**kwargs)
        self.field_type = field_type.lower()
        self.public_access = public_access.lower()
        self.max_size_bytes = max_size_mb * 1024 * 1024
        
        allowed_extensions = (
            self.IMAGE_EXTENSIONS if self.field_type == 'image' 
            else self.FILE_EXTENSIONS
        )
        self.validators.append(FileExtensionValidator(allowed_extensions=allowed_extensions))

    def validate_file(self, data):
        """Separate validation logic for the file."""
        if not data:
            if self.required:
                raise serializers.ValidationError("This field is required.")
            return None

        # Validate file size
        if data.size > self.max_size_bytes:
            raise serializers.ValidationError(
                f"File size exceeds maximum limit of {self.max_size_bytes / (1024 * 1024)} MB"
            )

        # Image-specific validation
        if self.field_type == 'image':
            try:
                from PIL import Image
                img = Image.open(data)
                img.verify()
                data.seek(0)  # Reset file pointer after verification
            except Exception as e:
                raise serializers.ValidationError(f"Invalid image file: {str(e)}")

        return data

    def to_internal_value(self, data):
        """Handle the file upload and return the URL."""
        file_obj = self.validate_file(data)
        if file_obj is None:
            return None
        return upload_file_to_azure(file_obj.name, file_obj)

    def to_representation(self, value):
        """Return the URL as is for output."""
        return value
    
