package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.DecimalMin
import jakarta.validation.constraints.DecimalMax

data class RatingRequestDTO(
    @field:Max(1, message = "Rating must be at most 1")
    @field:Min(-1, message = "Rating must be at least -1")
    val rating: Int,
    // For check if user is in the vicinity of the event/comment
    @field:DecimalMin("-90.0", message = "Latitude must be >= -90")
    @field:DecimalMax("90.0", message = "Latitude must be <= 90")
    val latitude: Double,
    @field:DecimalMin("-180.0", message = "Longitude must be >= -180")
    @field:DecimalMax("180.0", message = "Longitude must be <= 180")
    val longitude: Double
)
