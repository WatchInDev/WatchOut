package org.zpi.watchout.service.dto

import java.time.LocalDateTime

data class WeatherWarningDTO(
    val name: String,
    val description: String,
    val fromDate: LocalDateTime,
    val toDate: LocalDateTime,
    val locality: String
) : ExternalWarningDTO {
}
