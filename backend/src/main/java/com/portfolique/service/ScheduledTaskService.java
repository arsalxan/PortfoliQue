package com.portfolique.service;

import com.portfolique.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScheduledTaskService {

    private final UserRepository userRepository;

    @Scheduled(fixedRate = 1800000) // 30 mins
    @Transactional
    public void cleanupUnverifiedUsers() {
        log.info("Running cleanup task for expired unverified users...");
        userRepository.deleteByEmailVerifiedFalseAndEmailVerificationTokenExpiresBefore(LocalDateTime.now());
    }
}
