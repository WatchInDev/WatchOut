package org.zpi.watchout.service.dto

data class ClusterResponseDTO(
    val latitude: Double,
    val longitude: Double,
    val count: Long
) {
}