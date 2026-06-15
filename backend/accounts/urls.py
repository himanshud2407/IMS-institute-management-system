"""
Accounts URLs
=============
URL routing for authentication endpoints.

All URLs are prefixed with /api/auth/ (configured in backend/urls.py).

Endpoints:
    POST /api/auth/register/          → Create new user account
    POST /api/auth/login/             → Authenticate and get JWT tokens
    POST /api/auth/logout/            → Blacklist refresh token
    POST /api/auth/token/refresh/     → Get new access token using refresh token
    GET  /api/auth/me/                → Get authenticated user's profile
    POST /api/auth/change-password/   → Change password
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "accounts"

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path(
        "change-password/",
        views.ChangePasswordView.as_view(),
        name="change-password",
    ),
]
