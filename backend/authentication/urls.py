"""
URL configuration for authentication app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-token/', views.verify_token_view, name='verify_token'),
    path('change-password/', views.change_password, name='change_password'),
    path('update-profile/', views.update_profile, name='update_profile'),
    path('delete-account/', views.delete_account, name='delete_account'),
]

