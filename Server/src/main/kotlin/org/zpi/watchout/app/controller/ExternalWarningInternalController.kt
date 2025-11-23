package org.zpi.watchout.app.controller

import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.ExternalWarningsService
import org.zpi.watchout.service.dto.ElectricalOutageRequestDTO
import org.zpi.watchout.service.dto.WeatherDTO

@RestController
@RequestMapping("/api/v1/internal")
@Tag(name = "External Warnings for microservices", description = "External warnings internal management")
class ExternalWarningInternalController(
    private val externalWarningsService: ExternalWarningsService
) {

    @Value("\${app.internal-api-key}")
    private lateinit var internalApiKey: String

    @PostMapping("/warnings/weather")
    fun saveWeatherWarningData(@RequestHeader("INTERNAL_API_KEY") key: String, @RequestBody warnings:List<WeatherDTO>) {
        if (key != internalApiKey) {
            throw IllegalAccessException("Invalid API key")
        }
        externalWarningsService.saveWeatherWarnings(warnings)
    }

    @PostMapping("/warnings/electricity")
    fun saveElectricityWarningData(@RequestHeader("INTERNAL_API_KEY") key: String, @RequestBody warnings:ElectricalOutageRequestDTO) {
        if (key != internalApiKey) {
            throw IllegalAccessException("Invalid API key")
        }
        externalWarningsService.saveElectricalOutageWarning(warnings)
    }
}