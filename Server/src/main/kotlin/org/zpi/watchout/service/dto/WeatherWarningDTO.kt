package org.zpi.watchout.service.dto

import java.sql.Timestamp
import java.time.LocalDateTime

data class WeatherWarningDTO(
    val name: String,
    val description: String,
    val fromDate: Timestamp,
    val toDate: Timestamp,
    val locality: String
) : ExternalWarningDTO() {
}
