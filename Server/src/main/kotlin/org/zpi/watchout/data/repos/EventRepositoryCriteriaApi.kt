package org.zpi.watchout.data.repos

import org.zpi.watchout.service.dto.EventResponseDTO

interface EventRepositoryCriteriaApi {
    fun findByLocation(
        west: Double,
        south: Double,
        east: Double,
        north: Double
    ) : List<EventResponseDTO>
}