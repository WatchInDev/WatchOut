package org.zpi.watchout.app.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.EventTypeService


@RestController
@RequestMapping("/api/v1/event-types")
@Tag(name = "Event types", description = "Event types management")
class EventTypeController(
    private val eventTypeService: EventTypeService
) {

    @GetMapping
    @Operation(summary = "Get all event types")
    fun getAllEventTypes() = eventTypeService.getAllEventTypes()

    @GetMapping("/{name}")
    @Operation(summary = "Get event type by name")
    fun getEventTypeByName(@PathVariable name: String) = eventTypeService.getEventTypeByName(name)

}