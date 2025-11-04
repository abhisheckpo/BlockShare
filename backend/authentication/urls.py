"""
URL configuration for authentication app
"""
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('verify-token/', views.verify_token_view, name='verify_token'),
]

