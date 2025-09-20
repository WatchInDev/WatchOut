package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

data class ClusterRequestDTO(
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
    @field:Min(1, message = "Grid cells must be at least 1")
    val gridCells : Int,
)
