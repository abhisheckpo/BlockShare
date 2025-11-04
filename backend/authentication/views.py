"""
Authentication API Views
"""
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import IntegrityError
from django.utils import timezone
from .models import User
from .jwt_utils import generate_token


@api_view(['POST'])
def register(request):
    """
    Register a new user
    
    Expected JSON payload:
    {
        "username": "string",
        "email": "string",
        "password": "string"
    }
    """
    try:
        # Get data from request
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        # Validate required fields
        if not username or not email or not password:
            return Response({
                'success': False,
                'error': 'All fields are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate username
        is_valid, error = User.validate_username(username)
        if not is_valid:
            return Response({
                'success': False,
                'error': error
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate email
        is_valid, error = User.validate_email(email)
        if not is_valid:
            return Response({
                'success': False,
                'error': error
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        is_valid, error = User.validate_password_strength(password)
        if not is_valid:
            return Response({
                'success': False,
                'error': error
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response({
                'success': False,
                'error': 'Email already registered'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({
                'success': False,
                'error': 'Username already taken'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create new user
        user = User(
            username=username,
            email=email,
            password=password  # Will be hashed in model's save method
        )
        user.save()

        # Generate JWT token
        token = generate_token(user.id, user.email)

        return Response({
            'success': True,
            'message': 'Registration successful',
            'token': token,
            'userId': user.id,
            'email': user.email,
            'username': user.username
        }, status=status.HTTP_201_CREATED)

    except IntegrityError:
        return Response({
            'success': False,
            'error': 'User already exists'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def login(request):
    """
    Login user
    
    Expected JSON payload:
    {
        "email": "string",
        "password": "string"
    }
    """
    try:
        # Get data from request
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        # Validate required fields
        if not email or not password:
            return Response({
                'success': False,
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate email format
        is_valid, error = User.validate_email(email)
        if not is_valid:
            return Response({
                'success': False,
                'error': error
            }, status=status.HTTP_400_BAD_REQUEST)

        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Check if user is active
        if not user.is_active:
            return Response({
                'success': False,
                'error': 'Account is disabled'
            }, status=status.HTTP_403_FORBIDDEN)

        # Verify password
        if not user.check_password(password):
            return Response({
                'success': False,
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Update last login
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])

        # Generate JWT token
        token = generate_token(user.id, user.email)

        return Response({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'userId': user.id,
            'email': user.email,
            'username': user.username
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Login failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def verify_token_view(request):
    """
    Verify JWT token validity
    
    Expected header: Authorization: Bearer <token>
    """
    try:
        from .jwt_utils import verify_token
        
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Invalid authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(' ')[1]
        is_valid, payload_or_error = verify_token(token)

        if not is_valid:
            return Response({
                'success': False,
                'error': payload_or_error
            }, status=status.HTTP_401_UNAUTHORIZED)

        return Response({
            'success': True,
            'user_id': payload_or_error.get('user_id'),
            'email': payload_or_error.get('email')
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Token verification failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def change_password(request):
    """
    Change user password
    
    Expected header: Authorization: Bearer <token>
    Expected JSON payload:
    {
        "current_password": "string",
        "new_password": "string"
    }
    """
    try:
        from .jwt_utils import decode_token
        
        # Get and validate authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Invalid authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Decode token to get user_id
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        user_id = payload.get('user_id')

        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Get passwords from request
        current_password = request.data.get('current_password', '')
        new_password = request.data.get('new_password', '')

        # Validate required fields
        if not current_password or not new_password:
            return Response({
                'success': False,
                'error': 'Both current and new passwords are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify current password
        if not user.check_password(current_password):
            return Response({
                'success': False,
                'error': 'Current password is incorrect'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Validate new password strength
        is_valid, error = User.validate_password_strength(new_password)
        if not is_valid:
            return Response({
                'success': False,
                'error': error
            }, status=status.HTTP_400_BAD_REQUEST)

        # Update password
        user.password = new_password  # Will be hashed in model's save method
        user.save()

        return Response({
            'success': True,
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Password change failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def update_profile(request):
    """
    Update user profile (username and/or email)
    
    Expected header: Authorization: Bearer <token>
    Expected JSON payload:
    {
        "username": "string",
        "email": "string"
    }
    """
    try:
        from .jwt_utils import decode_token
        
        # Get and validate authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Invalid authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Decode token to get user_id
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        user_id = payload.get('user_id')

        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Get data from request
        username = request.data.get('username', '').strip()
        email = request.data.get('email', '').strip().lower()

        # Validate required fields
        if not username or not email:
            return Response({
                'success': False,
                'error': 'Username and email are required'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate username if changed
        if username != user.username:
            is_valid, error = User.validate_username(username)
            if not is_valid:
                return Response({
                    'success': False,
                    'error': error
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if username is already taken
            if User.objects.filter(username=username).exclude(id=user_id).exists():
                return Response({
                    'success': False,
                    'error': 'Username already taken'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Validate email if changed
        if email != user.email:
            is_valid, error = User.validate_email(email)
            if not is_valid:
                return Response({
                    'success': False,
                    'error': error
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if email is already registered
            if User.objects.filter(email=email).exclude(id=user_id).exists():
                return Response({
                    'success': False,
                    'error': 'Email already registered'
                }, status=status.HTTP_400_BAD_REQUEST)

        # Update user
        user.username = username
        user.email = email
        user.save()

        return Response({
            'success': True,
            'message': 'Profile updated successfully',
            'username': user.username,
            'email': user.email
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Profile update failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def delete_account(request):
    """
    Delete user account
    
    Expected header: Authorization: Bearer <token>
    Expected JSON payload:
    {
        "password": "string"
    }
    """
    try:
        from .jwt_utils import decode_token
        
        # Get and validate authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return Response({
                'success': False,
                'error': 'Invalid authorization header'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Decode token to get user_id
        token = auth_header.split(' ')[1]
        payload = decode_token(token)
        user_id = payload.get('user_id')

        # Get user
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'error': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)

        # Get password from request
        password = request.data.get('password', '')

        # Validate password
        if not password:
            return Response({
                'success': False,
                'error': 'Password is required to delete account'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verify password
        if not user.check_password(password):
            return Response({
                'success': False,
                'error': 'Incorrect password'
            }, status=status.HTTP_401_UNAUTHORIZED)

        # Delete user
        user.delete()

        return Response({
            'success': True,
            'message': 'Account deleted successfully'
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({
            'success': False,
            'error': f'Account deletion failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

