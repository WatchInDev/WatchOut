package org.zpi.watchout.app.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.context.annotation.Profile
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.DebugService

@RestController
@Profile("local")
@RequestMapping("/debug")
@Tag(name = "Debug", description = "Endpoints for testing and debugging purposes (local profile only)")
class DebugController(private val debugService: DebugService) {

    @DeleteMapping("/test-events")
    @Operation(summary = "Delete all events")
    fun clearEvents() {
        debugService.clearAllEvents()
    }

    @GetMapping("/test-events/{number}")
    @Operation(summary = "Generate sample events", description = "Generate a specified number of sample events for testing purposes for every type for main polish cities.")
    fun generateTestEvents(@PathVariable("number") number: Int) {
        debugService.generateSampleEvents(number)
    }

}