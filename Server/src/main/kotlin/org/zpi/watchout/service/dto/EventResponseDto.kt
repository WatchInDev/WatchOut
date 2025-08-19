package org.zpi.watchout.service.dto

import jakarta.persistence.Column
import java.net.IDN
import java.time.LocalDateTime


data class EventResponseDto(
    val id: Long,
    val name: String,
    val description : String,
    val image: ByteArray,
    val latitude: Double,
    val longitude: Double,
    val reportedDate: LocalDateTime,
    val endDate: LocalDateTime,
    val isActive: Boolean,
    val eventType: EventTypeDto
) {
}