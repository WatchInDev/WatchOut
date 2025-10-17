package org.zpi.watchout.app.controller
//
//import io.github.oshai.kotlinlogging.KotlinLogging
//import org.springframework.beans.factory.annotation.Value
//import org.springframework.http.ResponseEntity
//import org.springframework.web.bind.annotation.PostMapping
//import org.springframework.web.bind.annotation.RequestBody
//import org.springframework.web.bind.annotation.RequestHeader
//import org.springframework.web.bind.annotation.RequestMapping
//import org.springframework.web.bind.annotation.RestController
//import org.zpi.watchout.service.UserService
//
//private val logger = KotlinLogging.logger {}
//
//@RestController
//@RequestMapping("/entra/signup-hook")
//class SignUpHookController(
//    private val userService: UserService,
//    @Value("entra.api.secret") private val b2cApiSecret: String
//) {
//
//    @PostMapping
//    fun handleSignUp(
//        @RequestBody payload: Map<String, Any>,
//        @RequestHeader("X-B2C-Secret") secretHeader: String
//    ): ResponseEntity<Void> {
//
//        if (secretHeader != b2cApiSecret) {
//            logger.warn { "Unauthorized sign-up hook attempt with invalid secret." }
//            return ResponseEntity.status(403).build()
//        }
//
//        logger.info { "Handling sign-up hook for user: ${payload["sub"]}" }
//
//        val email = payload["email"] as String
//        val name = payload["name"] as String
//        val lastName = payload["lastName"] as String
//        val phone = payload["phone"] as String
//        val externalId = payload["sub"] as String
//
//        userService.createUser(externalId, name, lastName, email, phone)
//
//        logger.info { "User created with external ID: $externalId" }
//        return ResponseEntity.ok().build()
//    }
//}