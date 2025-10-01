package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class EventRequestDTO(
    @field:NotBlank(message = "Name must not be blank")
    val name: String,
    val description : String?,
    val image: ByteArray?,
    @field:Max(90, message = "Latitude must be between -90 and 90")
    @field:Min(-90, message = "Latitude must be between -90 and 90")
    val latitude: Double,
    @field:Max(180, message = "Longitude must be between -180 and 180")
    @Min(-180, message = "Longitude must be between -180 and 180")
    val longitude: Double,
    @field:Future(message = "End date must be in the future")
    val endDate: LocalDateTime,
    val eventTypeId: Long
) {
}