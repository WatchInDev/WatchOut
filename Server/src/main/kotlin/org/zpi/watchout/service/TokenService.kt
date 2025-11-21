package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.TokenFCMRepository
import org.zpi.watchout.service.dto.TokenFCMDTO

@Service
class TokenService(
    val tokenFCMRepository: TokenFCMRepository
) {
    fun upsertToken(userId: Long, token: TokenFCMDTO) {
        tokenFCMRepository.upsertToken(userId, token.tokenFCM)
    }

    fun getTokenByUserId(userId: Long): TokenFCMDTO {
        val tokenEntity = tokenFCMRepository.findByUserId(userId) ?: throw EntityNotFoundException("Token for user with id $userId not found")
        return TokenFCMDTO(tokenFCM = tokenEntity.token)
    }
}