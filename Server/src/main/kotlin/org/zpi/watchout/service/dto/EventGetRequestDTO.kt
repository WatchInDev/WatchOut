package org.zpi.watchout.service.dto

data class EventFilterDTO(
    val southWestLatitude: Double,
    val southWestLongitude: Double,
    val northEastLatitude: Double,
    val northEastLongitude: Double,
)
