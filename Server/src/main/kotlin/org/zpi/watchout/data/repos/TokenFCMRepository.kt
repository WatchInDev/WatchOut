package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.TokenFCM

interface TokenFCMRepository: JpaRepository<TokenFCM, Long> {
    fun findByUserId(userId: Long): TokenFCM?

    @Transactional
    @Modifying
    @Query(
        value = """
        INSERT INTO watchout.tokens_fcm (token, user_id)
        VALUES (:token, :userId)
        ON CONFLICT (user_id)
        DO UPDATE SET token = EXCLUDED.token
    """,
        nativeQuery = true
    )
    fun upsertToken(userId: Long, token: String)
}