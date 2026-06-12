package com.hireiq.service;

import com.hireiq.dto.AuthDto;
import com.hireiq.entity.User;
import com.hireiq.repository.UserRepository;
import com.hireiq.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * AuthService — handles registration and login.
 *
 * Register flow:
 *   1. Check email not already taken
 *   2. Hash the password with BCrypt
 *   3. Save the user
 *   4. Return a JWT token (user is logged in immediately after registering)
 *
 * Login flow:
 *   1. Use Spring's AuthenticationManager to verify email + password
 *   2. If valid, generate and return a JWT token
 */
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    // ── REGISTER ───────────────────────────────────────────────
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {

        // 1. Check for duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "An account with email " + request.getEmail() + " already exists.");
        }

        // 2. Generate secure token
        String activationToken = UUID.randomUUID().toString();

        // 3. Build and save the user (password is hashed, never stored as plain text)
        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole() != null ? request.getRole() : User.Role.CANDIDATE)
                .isActive(false)
                .activationToken(activationToken)
                .build();

        userRepository.save(user);

        // 4. Send activation email
        try {
            emailService.sendActivationEmail(user.getEmail(), user.getFullName(), activationToken);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return AuthDto.AuthResponse.builder()
                .token(null)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .message("Registration successful! An activation link has been sent to your registered email address. Please check your inbox and click the link to verify your account before logging in.")
                .activationToken(activationToken)
                .build();
    }

    // ── ACTIVATE ───────────────────────────────────────────────
    @Transactional
    public void activateUser(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Activation token is missing.");
        }
        User user = userRepository.findByActivationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired activation token."));

        user.setIsActive(true);
        user.setActivationToken(null);
        userRepository.save(user);
    }

    // ── LOGIN ──────────────────────────────────────────────────
    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {

        // 1. Spring's AuthenticationManager verifies email + password against DB
        //    It throws BadCredentialsException automatically if wrong
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Get the authenticated user details and generate a token
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. Fetch full user info for the response
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtils.generateToken(userDetails);

        return AuthDto.AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .message("Login successful!")
                .build();
    }
}