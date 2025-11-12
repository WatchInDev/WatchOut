package org.zpi.watchout.service.dto

import java.sql.Timestamp
import java.time.LocalDateTime

data class ElectricalOutageDTO(
    val location: String,
    val fromDate: Timestamp,
    val toDate: Timestamp,
    val provider: String
) : ExternalWarningDTO() {
}