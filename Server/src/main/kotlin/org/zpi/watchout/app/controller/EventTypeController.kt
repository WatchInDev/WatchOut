package org.zpi.watchout.app.controller

import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.EventTypeService


@RestController
@RequestMapping("/api/v1/event-types")
class EventTypeController(
    private val eventTypeService: EventTypeService
) {

    @RequestMapping
    fun getAllEventTypes() = eventTypeService.getAllEventTypes()

    @RequestMapping("/{name}")
    fun getEventTypeByName(@PathVariable name: String) = eventTypeService.getEventTypeByName(name)

}