package org.zpi.watchout.app.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.EventTypeService


@RestController
@RequestMapping("/api/v1/event-types")
class EventTypeController(
    private val eventTypeService: EventTypeService
) {

    @GetMapping
    fun getAllEventTypes() = eventTypeService.getAllEventTypes()

    @GetMapping("/{name}")
    fun getEventTypeByName(@PathVariable name: String) = eventTypeService.getEventTypeByName(name)

}