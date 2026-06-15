"""
Accounts Views
==============
API views for authentication: Register, Login, Logout, Me, ChangePassword.

Concept:
    Each view is a class-based DRF view that handles one specific auth action.
    Views use serializers for validation and return standardized JSON responses.

API Endpoints:
    POST   /api/auth/register/        → RegisterView
    POST   /api/auth/login/           → LoginView
    POST   /api/auth/logout/          → LogoutView
    GET    /api/auth/me/              → MeView
    POST   /api/auth/change-password/ → ChangePasswordView
    POST   /api/auth/token/refresh/   → TokenRefreshView (SimpleJWT built-in)
"""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    ChangePasswordSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(APIView):
    """
    POST /api/auth/register/
    
    Register a new user account.
    
    Request body:
        {
            "full_name": "John Doe",
            "email": "john@example.com",
            "password": "securepass123",
            "confirm_password": "securepass123",
            "role": "STUDENT"  // ADMIN, TEACHER, or STUDENT
        }
    
    Response:
        {
            "success": true,
            "message": "Registration successful",
            "data": {
                "user": {...},
                "tokens": {"access": "...", "refresh": "..."}
            }
        }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate tokens for auto-login after registration
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "full_name": user.full_name,
                    "role": user.role,
                },
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    """
    POST /api/auth/login/
    
    Authenticate user and return JWT tokens.
    
    Request body:
        {
            "email": "john@example.com",
            "password": "securepass123"
        }
    
    Response:
        {
            "success": true,
            "message": "Login successful",
            "data": {
                "user": {...},
                "tokens": {"access": "...", "refresh": "..."}
            }
        }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        return Response(
            {
                "message": "Login successful.",
                "user": data["user"],
                "tokens": data["tokens"],
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    
    Logout by blacklisting the refresh token.
    
    Request body:
        {
            "refresh": "<refresh_token>"
        }
    
    The access token will naturally expire (15 min).
    The refresh token is blacklisted so it can't be used to get new access tokens.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"message": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logout successful."},
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            print("Logout error:", e)
            return Response(
                {"message": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class MeView(APIView):
    """
    GET /api/auth/me/
    
    Return the authenticated user's profile data.
    Used by the frontend to check auth status and get user info on page load.
    
    Response:
        {
            "success": true,
            "data": {
                "id": "...",
                "email": "...",
                "full_name": "...",
                "role": "STUDENT"
            }
        }
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    """
    POST /api/auth/change-password/
    
    Change the authenticated user's password.
    
    Request body:
        {
            "old_password": "currentpass",
            "new_password": "newsecurepass",
            "confirm_new_password": "newsecurepass"
        }
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )
