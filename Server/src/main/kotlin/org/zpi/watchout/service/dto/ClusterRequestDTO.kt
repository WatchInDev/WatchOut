package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import java.time.LocalDateTime

data class ClusterRequestDTO(
    @field:Min(0, message = "Epsilon must be non-negative")
    @field:Max(10, message = "Epsilon must be at most 10")
    val eps: Double,
    @field:Min(1, message = "Minimum points must be at least 1")
    val minPoints: Int,

    @field:Max(90, message = "Latitude must be between -90 and 90")
    @field:Min(-90, message = "Latitude must be between -90 and 90")
    val swLat: Double,
    @field:Max(180, message = "Longitude must be between -180 and 180")
    @field:Min(-180, message = "Longitude must be between -180 and 180")
    val swLng: Double,
    @field:Max(90, message = "Latitude must be between -90 and 90")
    @field:Min(-90, message = "Latitude must be between -90 and 90")
    val neLat: Double,
    @field:Max(180, message = "Longitude must be between -180 and 180")
    @field:Min(-180, message = "Longitude must be between -180 and 180")
    val neLng: Double,

    val eventTypeIds: List<Long>?,
    val reportedDateFrom: LocalDateTime?,
    val reportedDateTo: LocalDateTime?,
    val distance : Double?,
    val rating : Double?
)
