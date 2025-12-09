package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Future
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import java.time.LocalDateTime

data class EditEventDTO(
    @field:NotBlank(message = "Name must not be blank")
    val name: String,
    val description : String,

    val newImages: List<ByteArray>?,
    val imagesToRemove: List<String>?,


    @field:Future(message = "End date must be in the future")
    val endDate: LocalDateTime,
    val eventTypeId: Long
) {
}