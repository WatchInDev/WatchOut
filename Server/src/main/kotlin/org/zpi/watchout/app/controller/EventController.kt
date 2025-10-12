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
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/events")
@Tag(name = "Events", description = "Events")
class EventController(val eventService: EventService) {

    @GetMapping
    @Operation(summary = "Get all events by location",
        description = "Get all events within the specified bounding box defined by South-West and North-East coordinates." +
                "\n" +"Optional Filter Description:" +
                "\n" + "eventTypeIds: List of event type IDs to filter events by their types." +
                "\n" + "reportedDateFrom: Start date to filter events reported after this date." +
                "\n" + "reportedDateTo: End date to filter events reported before this date." +
                "\n" + "distance: Maximum distance (in degrees) to filter events within this distance from the center of the bounding box." +
                "\n" + "rating: Minimum rating to filter events with at least this rating.")
    fun getAllEvents(@Valid eventGetRequestDTO: EventGetRequestDTO):List<EventResponseDTO> {
        logger.info { "Fetching all events" }
        val events = eventService.getAllEvents(eventGetRequestDTO)
        logger.info { "Fetched ${events.size} events" }
        return events
    }

    @GetMapping("/clusters")
    @Operation(summary = "Get clustered events by location",
        description = "Get clustered events within the specified bounding box defined by South-West and North-East coordinates. The clustering is based on density of events. Controlling parameters are eps (in degrees), and minPoints." +
                " Here is an explanation: An event is added to a cluster if it is either:\n" +
                "\n" +
                "A \"core\" geometry, that is within eps distance of at least minpoints events (including itself); or\n" +
                "\n" +
                "A \"border\" geometry, that is within eps distance of a core geometry." +
                "\n" +
        " Events that are neither core nor border are considered noise and do not belong to any cluster." +
                "\n" +
                " This method returns the centroid of each cluster along with the number of events in that cluster."+
                "\n" +
                " Note: eps is in degrees, so 0.01 is roughly 1.11 km" +
                "\n" +"Optional Filter Description:" +
    "\n" + "eventTypeIds: List of event type IDs to filter events by their types." +
    "\n" + "reportedDateFrom: Start date to filter events reported after this date." +
    "\n" + "reportedDateTo: End date to filter events reported before this date." +
    "\n" + "distance: Maximum distance (in degrees) to filter events within this distance from the center of the bounding box." +
    "\n" + "rating: Minimum rating to filter events with at least this rating.")
    fun getClusteredEvents(@Valid clusterRequestDto: ClusterRequestDTO): List<ClusterResponseDTO> {
        logger.info { "Fetching clustered events" }
        logger.info { "Cluster request: SW(${clusterRequestDto.swLat}, ${clusterRequestDto.swLng}), NE(${clusterRequestDto.neLat}, ${clusterRequestDto.neLng}), eps=${clusterRequestDto.eps}, minPoints=${clusterRequestDto.minPoints}" }
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
