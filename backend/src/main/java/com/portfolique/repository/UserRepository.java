package com.portfolique.repository;

import com.portfolique.entity.User;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByUsername(String username);

  Optional<User> findByEmail(String email);

  Optional<User> findByEmailVerificationToken(String emailVerificationToken);

  boolean existsByUsername(String username);

  boolean existsByEmail(String email);

  Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);

  void deleteByEmailVerifiedFalseAndEmailVerificationTokenExpiresBefore(LocalDateTime time);
}
