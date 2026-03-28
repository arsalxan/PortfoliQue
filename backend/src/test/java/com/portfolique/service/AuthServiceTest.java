package com.portfolique.service;

import com.portfolique.dto.request.RegisterRequest;
import com.portfolique.dto.response.AuthResponse;
import com.portfolique.entity.Role;
import com.portfolique.entity.User;
import com.portfolique.repository.UserRepository;
import com.portfolique.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    @Test
    void testRegister_UserAlreadyExists() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("existing");
        req.setEmail("test@gmail.com");

        when(userRepository.existsByUsername("existing")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(req));
    }

    @Test
    void testRegister_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("newuser");
        req.setEmail("new@gmail.com");
        req.setFullName("New User");
        req.setPassword("pass");

        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(User.builder()
                .username("newuser")
                .role(Role.USER)
                .build());

        AuthResponse res = authService.register(req);

        assertThat(res.getMessage()).contains("registered successfully");
        verify(emailService).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void testVerifyEmail_Success() {
        User user = User.builder()
                .emailVerified(false)
                .emailVerificationToken("token")
                .emailVerificationTokenExpires(LocalDateTime.now().plusHours(1))
                .role(Role.USER)
                .build();
        when(userRepository.findByEmailVerificationToken("token")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any())).thenReturn("token");

        authService.verifyEmail("token");

        assertThat(user.isEmailVerified()).isTrue();
        assertThat(user.getEmailVerificationToken()).isNull();
        verify(userRepository).save(user);
    }
}
