package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class EventRequestDto(
    @NotBlank
    val name: String,
    val description : String?,
    val image: ByteArray?,
    @Max(90)
    @Min(-90)
    val latitude: Double,
    @Max(180)
    @Min(-180)
    val longitude: Double,
    @Future
    val endDate: LocalDateTime,
    val eventTypeId: Long
) {
}