package com.hireiq.controller;

import com.hireiq.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1.0/activate")
@RequiredArgsConstructor
@Tag(name = "Activation", description = "User email activation endpoint")
public class ActivationController {

    private final AuthService authService;

    @Value("${app.frontend.url:}")
    private String configuredFrontendUrl;

    @Value("${RENDER:false}")
    private String isRender;

    private String getFrontendUrl() {
        if (configuredFrontendUrl != null && !configuredFrontendUrl.isBlank() && !configuredFrontendUrl.contains("localhost")) {
            return configuredFrontendUrl;
        }
        if ("true".equalsIgnoreCase(isRender)) {
            return "https://hire-iq-psi.vercel.app";
        }
        return "http://localhost:3000";
    }

    @GetMapping(produces = MediaType.TEXT_HTML_VALUE)
    @Operation(summary = "Activate a user account", description = "Exposes a GET /api/v1.0/activate endpoint to activate user account via token.")
    public String activate(@RequestParam("token") String token) {
        try {
            authService.activateUser(token);
            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Account Activated | HireIQ</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                            background-color: #080D18;
                            color: #E8EAF6;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            margin: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                        }
                        .container {
                            background-color: #0D1526;
                            border: 1px solid #2E4268;
                            border-radius: 12px;
                            padding: 40px;
                            text-align: center;
                            max-width: 450px;
                            width: 100%;
                            box-shadow: 0 8px 24px rgba(30, 95, 168, 0.2);
                        }
                        h1 {
                            color: #E07B39;
                            margin-top: 0;
                            font-size: 26px;
                        }
                        p {
                            color: #8B96B8;
                            line-height: 1.6;
                            font-size: 16px;
                            margin-bottom: 30px;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #1E5FA8;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 12px 28px;
                            font-size: 15px;
                            font-weight: 600;
                            border-radius: 6px;
                            transition: background-color 0.2s;
                        }
                        .btn:hover {
                            background-color: #173E6B;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div style="font-size: 48px; margin-bottom: 20px;">✔️</div>
                        <h1>Activation Successful!</h1>
                        <p>Your account has been successfully verified and activated. You can now close this window and log in to the HireIQ platform.</p>
                        <a href="http://localhost:3000/login" class="btn">Go to Login Page</a>
                    </div>
                </body>
                </html>
                """;
            return html.replace("http://localhost:3000", getFrontendUrl());
        } catch (IllegalArgumentException e) {
            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Activation Failed | HireIQ</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                        body {
                            background-color: #080D18;
                            color: #E8EAF6;
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            margin: 0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            min-height: 100vh;
                        }
                        .container {
                            background-color: #0D1526;
                            border: 1px solid #EF4444;
                            border-radius: 12px;
                            padding: 40px;
                            text-align: center;
                            max-width: 450px;
                            width: 100%;
                            box-shadow: 0 8px 24px rgba(239, 68, 68, 0.1);
                        }
                        h1 {
                            color: #EF4444;
                            margin-top: 0;
                            font-size: 26px;
                        }
                        p {
                            color: #8B96B8;
                            line-height: 1.6;
                            font-size: 16px;
                            margin-bottom: 30px;
                        }
                        .btn {
                            display: inline-block;
                            background-color: #1E5FA8;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 12px 28px;
                            font-size: 15px;
                            font-weight: 600;
                            border-radius: 6px;
                            transition: background-color 0.2s;
                        }
                        .btn:hover {
                            background-color: #173E6B;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
                        <h1>Activation Failed</h1>
                        <p>%s</p>
                        <a href="http://localhost:3000/register" class="btn">Try Registering Again</a>
                    </div>
                </body>
                </html>
                """;
            return html.replace("http://localhost:3000", getFrontendUrl())
                       .replace("%s", e.getMessage());
        }
    }
}
