package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.service.EventTypeService
import org.zpi.watchout.service.dto.EventTypeDto

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/event-types")
@Tag(name = "Event types", description = "Event types management")
class EventTypeController(
    private val eventTypeService: EventTypeService
) {

    @GetMapping
    @Operation(summary = "Get all event types")
    fun getAllEventTypes() : List<EventTypeDto> {
        logger.info { "Fetching all event types" }
        return eventTypeService.getAllEventTypes()
            .also { logger.info { "Fetched ${it.size} event types" } }
    }

    @GetMapping("/{name}")
    @Operation(summary = "Get event type by name")
    fun getEventTypeByName(@PathVariable name: String) : EventTypeDto {
        logger.info { "Fetching event type with name: $name" }
        return eventTypeService.getEventTypeByName(name)
            .also { logger.info { "Fetched event type: $it" } }
    }

}