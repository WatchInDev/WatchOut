package org.zpi.watchout.app.controller

import com.azure.core.annotation.Get
import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
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
@Tag(name = "External Warnings", description = "External warnings management")
class ExternalWarningController(val externalWarningService: ExternalWarningsService) {

    @GetMapping
    @Operation(summary = "Fetch external warnings for the authenticated user", description = "" +
            "Swagger is unable to display output format correctly. Here is an example of the output:\n" +"""
                [
              {
                "type": "electrical_outage",
                "location": "Kielecka 37",
                "fromDate": "2025-10-24T03:00:00.000+00:00",
                "toDate": "2025-11-30T13:00:00.000+00:00",
                "provider": "Tauron",
                "placeName": "string"
              },
              {
                "type": "weather",
                "name": "Gęsta mgła",
                "description": "Prognozuje się gęste mgły, w zasięgu których widzialność może miejscami wynosić poniżej 200 m.",
                "fromDate": "2025-11-09T20:00:00.000+00:00",
                "toDate": "2025-11-16T17:00:00.000+00:00",
                "locality": "elbląski",
                "placeName": "string1"
              },
              {
                "type": "electrical_outage",
                "location": "Kresowa",
                "fromDate": "2025-10-26T03:47:18.010+00:00",
                "toDate": "2025-11-30T12:00:00.000+00:00",
                "provider": "Tauron",
                "placeName": "string2"
              }
            ]
            """)
    fun fetchExternalWarnings(@Parameter(hidden = true) @AuthenticationPrincipal userId : Long) : List<ExternalWarningDTO> {
        logger.info { "Fetching external warnings for user with id: $userId" }
        val result = externalWarningService.getExternalWarning(userId)
        logger.info { "Fetched ${result.size} external warnings for user with id: $userId" }
        return result
    }
}