package org.zpi.watchout.app.controller

import com.azure.core.annotation.Get
import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.ExternalWarningsService
import org.zpi.watchout.service.dto.ExternalWarningDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/external-warnings")
@Tag(name = "Event types", description = "Event types management")
class ExternalWarningController(val externalWarningService: ExternalWarningsService) {

    @GetMapping
    fun fetchExternalWarnings(@Parameter(hidden = true) @AuthenticationPrincipal userId : Long) : List<ExternalWarningDTO> {
        logger.info { "Fetching external warnings for user with id: $userId" }
        val result = externalWarningService.getExternalWarning(userId)
        logger.info { "Fetched ${result.size} external warnings for user with id: $userId" }
        return result
    }
}