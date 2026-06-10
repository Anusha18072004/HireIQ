package com.hireiq.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * JwtAuthFilter runs ONCE per request.
 *
 * Flow:
 *   1. Extract the Bearer token from the Authorization header
 *   2. Validate it using JwtUtils
 *   3. Load the user from the database
 *   4. Set the user as authenticated in Spring Security's context
 *
 * After this filter runs, Spring Security knows WHO is making the request.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Debug logging — helps trace 403 issues; remove after fixing
        log.debug("Request: {} {}", request.getMethod(), request.getRequestURI());
        log.debug("Authorization header: {}",
                request.getHeader("Authorization") != null ? "Present" : "MISSING");
        log.debug("Content-Type: {}", request.getContentType());

        try {
            String token = extractTokenFromRequest(request);

            if (token != null && !token.isBlank()) {
                String email = jwtUtils.extractEmail(token);

                // Only authenticate if not already authenticated
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    if (jwtUtils.isTokenValid(token, userDetails)) {
                        // Create authentication object and store it in the context
                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );
                        authToken.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("Authenticated user: {} with roles: {}",
                                email, userDetails.getAuthorities());
                    } else {
                        log.warn("Invalid JWT token for: {}", request.getRequestURI());
                    }
                }
            } else {
                log.debug("No JWT token found for: {}", request.getRequestURI());
            }
        } catch (Exception e) {
            log.error("JWT Filter error: {} for URI: {}", e.getMessage(), request.getRequestURI());
        }

        // Always continue the filter chain
        filterChain.doFilter(request, response);
    }

    // ── Extract "Bearer <token>" from the Authorization header ─
    // Checks both "Authorization" and "authorization" (lowercase) to be safe
    private String extractTokenFromRequest(HttpServletRequest request) {
        // Standard capitalised header
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        // Lowercase fallback — some proxies/clients send it lowercase
        header = request.getHeader("authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7).trim();
        }
        return null;
    }
}