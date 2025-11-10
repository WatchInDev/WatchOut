package org.zpi.watchout.service.dto

import java.time.LocalDateTime

data class ElectricalOutageDTO(
    val location: String,
    val fromDate: LocalDateTime,
    val toDate: LocalDateTime,
    val provider: String
) : ExternalWarningDTO {
}