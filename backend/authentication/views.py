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

