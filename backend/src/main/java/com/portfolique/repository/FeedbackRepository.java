package com.portfolique.repository;

import com.portfolique.entity.Feedback;
import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
  Page<Feedback> findByPortfolioOrderByCreatedAtDesc(Portfolio portfolio, Pageable pageable);

  Page<Feedback> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

  Long countByPortfolio(Portfolio portfolio);

  @Query(
      "SELECT f FROM Feedback f JOIN f.user u WHERE "
          + "(:username IS NULL OR LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND "
          + "(:content IS NULL OR "
          + "LOWER(f.design) LIKE LOWER(CONCAT('%', :content, '%')) OR "
          + "LOWER(f.responsiveness) LIKE LOWER(CONCAT('%', :content, '%')) OR "
          + "LOWER(f.content) LIKE LOWER(CONCAT('%', :content, '%')) OR "
          + "LOWER(f.uxFlow) LIKE LOWER(CONCAT('%', :content, '%')) OR "
          + "LOWER(f.accessibility) LIKE LOWER(CONCAT('%', :content, '%')) OR "
          + "LOWER(f.technicalPerformance) LIKE LOWER(CONCAT('%', :content, '%')) OR "
          + "LOWER(f.additional) LIKE LOWER(CONCAT('%', :content, '%')))")
  Page<Feedback> searchByFilters(
      @Param("username") String username, @Param("content") String content, Pageable pageable);
}
