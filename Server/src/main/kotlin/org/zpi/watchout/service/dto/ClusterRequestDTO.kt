package org.zpi.watchout.service.dto

data class ClusterRequestDTO(
    val southWestLatitude: Double,
    val southWestLongitude: Double,
    val northEastLatitude: Double,
    val northEastLongitude: Double,
    val gridCells : Int,
)
