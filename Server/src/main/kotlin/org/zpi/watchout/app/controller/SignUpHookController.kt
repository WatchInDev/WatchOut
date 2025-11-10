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

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/entra/signup-hook")
class SignUpHookController(
    private val userService: UserService
) {

    @PostMapping
    fun handleSignUp(@AuthenticationPrincipal jwt: Jwt): ResponseEntity<Void> {

        val externalId = jwt.subject
        val email = (jwt.claims["emails"] as? List<*>)?.firstOrNull() as? String
            ?: return ResponseEntity.badRequest().build()
        val displayName = jwt.claims["name"] as? String
            ?: return ResponseEntity.badRequest().build()


        if (externalId.isNullOrBlank() || email.isNullOrBlank()) {
            logger.warn { "Missing required fields in signup" }
            return ResponseEntity.badRequest().build()
        }

        userService.createUser(
            externalId = externalId,
            name = displayName,
            email = email
        )

        logger.info { "User created with external ID: $externalId, email: $email" }
        return ResponseEntity.ok().build()
    }
}