package com.portfolique.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(unique = true, nullable = false)
  private String username;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String fullName;

  @Column private String profilePicture;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private boolean emailVerified;

  @Column private String emailVerificationToken;

  @Column private LocalDateTime emailVerificationTokenExpires;

  @Enumerated(EnumType.STRING)
  private Role role;

  // ── Owned relationships: cascades so all child data is deleted with the user ──

  @Builder.Default
  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Portfolio> portfolios = new ArrayList<>();

  @Builder.Default
  @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Feedback> feedbacksGiven = new ArrayList<>();

  @Builder.Default
  @OneToMany(mappedBy = "recipient", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Notification> notificationsReceived = new ArrayList<>();

  @Builder.Default
  @OneToMany(mappedBy = "sender", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Notification> notificationsSent = new ArrayList<>();

  @CreationTimestamp private LocalDateTime createdAt;

  @UpdateTimestamp private LocalDateTime updatedAt;

  // UserDetails overrides for Spring Security
  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
  }

  @Override
  public boolean isAccountNonExpired() {
    return true;
  }

  @Override
  public boolean isAccountNonLocked() {
    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {
    return true;
  }

  @Override
  public boolean isEnabled() {
    return this.emailVerified;
  }
}
