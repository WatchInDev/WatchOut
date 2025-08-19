package org.zpi.watchout.service.dto

import java.time.LocalDateTime

data class EventRequestDto(
    val name: String,
    val description : String,
    val image: ByteArray,
    val latitude: Double,
    val longitude: Double,
    val reportedDate: LocalDateTime,
    val endDate: LocalDateTime,
    val eventTypeId: Long
) {
}