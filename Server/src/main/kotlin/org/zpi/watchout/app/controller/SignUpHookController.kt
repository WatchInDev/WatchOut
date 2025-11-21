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

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/users/create")
class SignUpHookController(
    private val userService: UserService
) {

    @PostMapping
    fun handleSignUp(@RequestBody userCreateRequestDTO: UserCreateRequestDTO) {
        logger.info { "Received sign-up hook for user with external ID: ${userCreateRequestDTO.firebaseUid} and email: ${userCreateRequestDTO.email}" }
        userService.createUser(
            externalId = userCreateRequestDTO.firebaseUid,
            name = userCreateRequestDTO.displayName,
            email = userCreateRequestDTO.email
        )
        logger.info { "User created with external ID: ${userCreateRequestDTO.firebaseUid} and email: ${userCreateRequestDTO.email}" }
    }
}