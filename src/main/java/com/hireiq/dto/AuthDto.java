package com.hireiq.dto;

import com.hireiq.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

// ── Nested DTOs — all auth-related request/response objects live here ──

public class AuthDto {

    // ── REGISTER REQUEST ───────────────────────────────────────
    @Data
    public static class RegisterRequest {

        @NotBlank(message = "Full name is required")
        private String fullName;

        @Email(message = "Enter a valid email")
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        // Role must be CANDIDATE or RECRUITER (ADMIN is created manually)
        private User.Role role = User.Role.CANDIDATE;
    }

    // ── LOGIN REQUEST ──────────────────────────────────────────
    @Data
    public static class LoginRequest {

        @Email @NotBlank
        private String email;

        @NotBlank
        private String password;
    }

    // ── AUTH RESPONSE (returned on success) ───────────────────
    @Data
    @lombok.Builder
    public static class AuthResponse {
        private String token;
        private String email;
        private String fullName;
        private String role;
        private String message;
        private String activationToken;
    }
}