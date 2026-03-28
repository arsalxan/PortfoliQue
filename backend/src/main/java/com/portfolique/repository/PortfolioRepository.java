package com.portfolique.repository;

import com.portfolique.entity.Portfolio;
import com.portfolique.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    Page<Portfolio> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
    
    @Query("SELECT p FROM Portfolio p JOIN p.user u WHERE " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Portfolio> searchByDescriptionOrUsername(@Param("query") String query, Pageable pageable);

    @Query(value = "SELECT p FROM Portfolio p LEFT JOIN p.feedbacks f GROUP BY p ORDER BY COUNT(f) ASC",
           countQuery = "SELECT COUNT(p) FROM Portfolio p")
    Page<Portfolio> findAllSortedByFewestFeedbacks(Pageable pageable);
}
