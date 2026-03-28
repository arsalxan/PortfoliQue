package com.portfolique.service;

import com.portfolique.dto.request.LoginRequest;
import com.portfolique.dto.request.RegisterRequest;
import com.portfolique.dto.response.AuthResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername().toLowerCase()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail().toLowerCase()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        
        String email = request.getEmail().toLowerCase();
        if (!email.endsWith("@gmail.com") && !email.endsWith("@outlook.com") && !email.endsWith("@chitkara.edu.in")) {
            throw new RuntimeException("Email domain not permitted");
        }

        String token = UUID.randomUUID().toString();

        User user = User.builder()
                .username(request.getUsername().toLowerCase())
                .email(email)
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .emailVerificationToken(token)
                .emailVerificationTokenExpires(LocalDateTime.now().plusHours(1))
                .role(Role.USER)
                .build();

        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), token);

        return AuthResponse.builder()
                .message("User registered successfully. Please check your email to verify your account.")
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername().toLowerCase(), request.getPassword())
        );

        User user = userRepository.findByUsername(request.getUsername().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.isEmailVerified()) {
            throw new RuntimeException("Please verify your email before logging in.");
        }

        String jwt = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .message("Login successful")
                .build();
    }

    public AuthResponse verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired verification token"));

        if (user.getEmailVerificationTokenExpires().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        user.setEmailVerificationTokenExpires(null);
        userRepository.save(user);

        String jwt = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(jwt)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .profilePicture(user.getProfilePicture())
                .message("Email verified successfully")
                .build();
    }
}
