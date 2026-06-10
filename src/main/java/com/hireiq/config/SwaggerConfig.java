package com.hireiq.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * SwaggerConfig — sets up the Swagger UI at http://localhost:8080/swagger-ui.html
 *
 * Key feature: adds a JWT "Authorize" button to Swagger UI so you can
 * paste your token once and all protected endpoints will use it automatically.
 */
@Configuration
public class SwaggerConfig {

    private static final String SECURITY_SCHEME_NAME = "Bearer Authentication";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(apiInfo())
                // Tell Swagger that all endpoints can require a Bearer token
                .addSecurityItem(new SecurityRequirement()
                        .addList(SECURITY_SCHEME_NAME))
                // Define what "Bearer Authentication" means
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, jwtSecurityScheme()));
    }

    private Info apiInfo() {
        return new Info()
                .title("HireIQ — Smart Recruitment API")
                .description("""
                        AI-Powered Recruitment Platform API.
                        
                        How to test protected endpoints:
                        1. Call POST /api/auth/register or /api/auth/login
                        2. Copy the "token" value from the response
                        3. Click the green "Authorize" button at the top of this page
                        4. Paste the token (just the token, no "Bearer" prefix needed)
                        5. Click Authorize — now all protected endpoints will work
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("HireIQ Team")
                        .email("admin@hireiq.com"));
    }

    private SecurityScheme jwtSecurityScheme() {
        return new SecurityScheme()
                .name(SECURITY_SCHEME_NAME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Paste your JWT token here (without 'Bearer' prefix)");
    }
}