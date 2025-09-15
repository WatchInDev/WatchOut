package org.zpi.watchout.service.dto

import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min

data class EventFilterDTO(
    @field:Max(90, message = "Latitude must be between -90 and 90")
    @field:Min(-90, message = "Latitude must be between -90 and 90")
    val southWestLatitude: Double,
    @field:Max(180, message = "Longitude must be between -180 and 180")
    @field:Min(-180, message = "Longitude must be between -180 and 180")
    val southWestLongitude: Double,
    @field:Max(90, message = "Latitude must be between -90 and 90")
    @field:Min(-90, message = "Latitude must be between -90 and 90")
    val northEastLatitude: Double,
    @field:Max(180, message = "Longitude must be between -180 and 180")
    @field:Min(-180, message = "Longitude must be between -180 and 180")
    val northEastLongitude: Double
)
