package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.EventService
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventFilterDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Events", description = "Events")
class EventController(val eventService: EventService) {

    @GetMapping
    @Operation(summary = "Get all events by location",
        description = "Get all events within the specified bounding box defined by South-West and North-East coordinates.")
    fun getAllEvents(@Valid eventFilterDTO: EventFilterDTO):List<EventResponseDTO> {
        logger.info { "Fetching all events" }
        val events = eventService.getAllEvents(eventFilterDTO)
        logger.info { "Fetched ${events.size} events" }
        return events
    }

    @GetMapping("/clusters")
    @Operation(summary = "Get clustered events by location",
        description = "Get clustered events within the specified bounding box defined by South-West and North-East coordinates. Bounding box is Divided into gridCells x gridCells cells, and events within each cell are clustered together. The response contains the centroid of each cluster along with the count of events in that cluster.")
    fun getClusteredEvents(@Valid clusterRequestDto: ClusterRequestDTO): List<ClusterResponseDTO> {
        logger.info { "Fetching clustered events" }
        logger.info { "Cluster request: SW(${clusterRequestDto.swLat}, ${clusterRequestDto.swLng}), NE(${clusterRequestDto.neLat}, ${clusterRequestDto.neLng}), gridCells: ${clusterRequestDto.gridCells}" }
        val clusters = eventService.getClusters(clusterRequestDto)
        logger.info { "Fetched ${clusters.size} clustered events" }
        return clusters
    }

    @PostMapping
    @Operation(summary = "Create a new event")
    fun createEvent(@RequestBody @Valid eventRequestDto: EventRequestDTO): EventResponseDTO {
        logger.info { "Creating event with request name: ${eventRequestDto.name}" }
        val createdEvent = eventService.createEvent(eventRequestDto)
        logger.info { "Created event with name and id: ${createdEvent.name}, ${createdEvent.id}" }
        return createdEvent
    }
}