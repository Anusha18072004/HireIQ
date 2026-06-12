package com.hireiq.controller;

import com.hireiq.entity.User;
import com.hireiq.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * DebugController — temporary endpoint to verify JWT token flow.
 *
 * Usage: GET /api/debug/auth
 * Returns whether the token was received, parsed, and which user/roles it resolved to.
 *
 * !! Remove this controller (or the /api/debug/** permit in SecurityConfig) once the 403 is resolved !!
 */
@RestController
@RequestMapping("/api/debug")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/activate-all")
    public ResponseEntity<?> activateAll() {
        List<User> users = userRepository.findAll();
        int count = 0;
        for (User u : users) {
            if (u.getIsActive() == null || !u.getIsActive()) {
                u.setIsActive(true);
                u.setActivationToken(null);
                userRepository.save(u);
                count++;
            }
        }
        return ResponseEntity.ok(Map.of(
                "message", "Successfully activated " + count + " users.",
                "totalUsers", users.size()
        ));
    }

    @GetMapping("/auth")
    public ResponseEntity<?> debugAuth(
            @AuthenticationPrincipal UserDetails user,
            HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        return ResponseEntity.ok(Map.of(
                "authHeader",     authHeader != null
                                      ? authHeader.substring(0, Math.min(30, authHeader.length())) + "..."
                                      : "MISSING — token not sent",
                "authenticated",  user != null,
                "email",          user != null ? user.getUsername() : "null",
                "roles",          user != null ? user.getAuthorities().toString() : "null",
                "contentType",    request.getContentType() != null ? request.getContentType() : "none"
        ));
    }
}
