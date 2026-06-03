package com.portfolique.repository;

import com.portfolique.entity.AiReview;
import com.portfolique.entity.AiReviewStatus;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiReviewRepository extends JpaRepository<AiReview, Long> {

  Optional<AiReview> findTopByPortfolioAndStatusOrderByVersionDesc(
      Portfolio portfolio, AiReviewStatus status);

  Optional<AiReview> findTopByPortfolioOrderByVersionDesc(Portfolio portfolio);

  Page<AiReview> findByPortfolioOrderByVersionDesc(Portfolio portfolio, Pageable pageable);

  Integer countByPortfolio(Portfolio portfolio);

  // Get the absolute latest review run by a specific user across all their portfolios
  Optional<AiReview> findTopByPortfolio_UserOrderByCreatedAtDesc(User user);

  // Per-user daily rate limit: did this user trigger ANY review today?
  boolean existsByPortfolio_UserAndCreatedAtAfter(User user, LocalDateTime since);
}
