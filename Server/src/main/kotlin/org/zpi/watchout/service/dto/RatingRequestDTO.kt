package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

data class RatingRequestDTO(
    @field:Max(1, message = "Rating must be at most 1")
    @field:Min(-1, message = "Rating must be at least -1")
    val rating: Int,
    // For check if user is in the vicinity of the event/comment
    val latitude: Double,
    val longitude: Double
)
