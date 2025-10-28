package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.TokenService
import org.zpi.watchout.service.dto.TokenFCMDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/fcm-tokens")
@Tag(name = "FCM Tokens", description = "Firebase Cloud Messaging Tokens management")
class TokenController(val tokenService: TokenService) {
    @GetMapping
    @Operation(summary = "Get FCM token for the authenticated user")
    fun getToken(@Parameter(hidden = true) @AuthenticationPrincipal userId : Long): TokenFCMDTO {
        logger.info { "Received request to get FCM token for userId=$userId" }
        val tokenDTO = tokenService.getTokenByUserId(userId)
        logger.info { "Returning FCM token for userId=$userId" }
        return tokenDTO
    }

    @PostMapping
    @Operation(summary = "Upsert FCM token for the authenticated user")
    fun upsertToken(@Parameter(hidden = true) @AuthenticationPrincipal userId : Long, @RequestBody tokenDTO: TokenFCMDTO) {
        logger.info { "Received request to upsert FCM token for userId=$userId" }
        tokenService.upsertToken(userId, tokenDTO)
        logger.info { "Upserted FCM token for userId=$userId" }
    }
}