package com.hireiq.controller;

import com.hireiq.dto.AuthDto;
import com.hireiq.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * AuthController — public endpoints, no JWT required.
 *
 * POST /api/auth/register  →  create account, returns JWT
 * POST /api/auth/login     →  verify credentials, returns JWT
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "1. Authentication", description = "Register and login — no token required")
public class AuthController {

    private final AuthService authService;

    // ── REGISTER ───────────────────────────────────────────────
    @PostMapping("/register")
    @Operation(
            summary = "Register a new account",
            description = "Creates a new user. Role can be CANDIDATE or RECRUITER. Returns a JWT token on success."
    )
    public ResponseEntity<?> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        try {
            AuthDto.AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ── LOGIN ──────────────────────────────────────────────────
    @PostMapping("/login")
    @Operation(
            summary = "Login to your account",
            description = "Verifies email + password. Returns a JWT token — copy it and click Authorize above."
    )
    public ResponseEntity<?> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        try {
            AuthDto.AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.DisabledException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Your account is not activated yet. Please check your email for the activation link."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }
    }
}