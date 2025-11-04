from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import EmailValidator
import re


class User(models.Model):
    """Custom User model for BlockShare authentication"""
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(max_length=255, unique=True, validators=[EmailValidator()])
    password = models.CharField(max_length=255)  # Hashed password
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Hash and set the password"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Check if the provided password matches the hashed password"""
        return check_password(raw_password, self.password)

    @staticmethod
    def validate_password_strength(password):
        """
        Validate password strength
        Returns: (is_valid, error_message)
        """
        if len(password) < 6:
            return False, "Password must be at least 6 characters long"
        
        if not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter"
        
        if not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter"
        
        if not re.search(r'\d', password):
            return False, "Password must contain at least one number"
        
        return True, None

    @staticmethod
    def validate_email(email):
        """
        Validate email format
        Returns: (is_valid, error_message)
        """
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            return False, "Invalid email format"
        return True, None

    @staticmethod
    def validate_username(username):
        """
        Validate username
        Returns: (is_valid, error_message)
        """
        if len(username) < 3:
            return False, "Username must be at least 3 characters long"
        
        if len(username) > 150:
            return False, "Username must not exceed 150 characters"
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return False, "Username can only contain letters, numbers, and underscores"
        
        return True, None

    def save(self, *args, **kwargs):
        """Override save to ensure password is hashed"""
        # Only hash if password doesn't look like it's already hashed
        if self.password and not self.password.startswith('pbkdf2_'):
            self.set_password(self.password)
        super().save(*args, **kwargs)

