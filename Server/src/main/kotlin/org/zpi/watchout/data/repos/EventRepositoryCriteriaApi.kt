package org.zpi.watchout.data.repos

import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO

interface EventRepositoryCriteriaApi {
    fun findByLocation(
        filters: EventGetRequestDTO
    ) : List<EventResponseDTO>

    fun calculateClusters(
        filters: ClusterRequestDTO,
        eps: Double,
        minpoints: Int
    ) : List<ClusterResponseDTO>
}