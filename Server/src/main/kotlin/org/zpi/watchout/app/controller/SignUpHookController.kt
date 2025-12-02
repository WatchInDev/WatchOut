package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.UserService
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.zpi.watchout.service.dto.UserCreateRequestDTO
import java.nio.file.AccessDeniedException

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/users/create")
class SignUpHookController(
    private val userService: UserService
) {

    @PostMapping
    fun handleSignUp(@RequestBody userCreateRequestDTO: UserCreateRequestDTO, @AuthenticationPrincipal externalId: String) {
        logger.info { "Received sign-up hook for user with external ID: ${userCreateRequestDTO.firebaseUid} and email: ${userCreateRequestDTO.email}" }
        if(externalId != userCreateRequestDTO.firebaseUid) {
            logger.error { "External ID from token does not match the one in the request body. Token external ID: $externalId, Request body external ID: ${userCreateRequestDTO.firebaseUid}" }
            throw org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException("External ID mismatch")
        }
        userService.createUser(
            externalId = userCreateRequestDTO.firebaseUid,
            name = userCreateRequestDTO.displayName,
            email = userCreateRequestDTO.email
        )
        logger.info { "User created with external ID: ${userCreateRequestDTO.firebaseUid} and email: ${userCreateRequestDTO.email}" }
    }
}