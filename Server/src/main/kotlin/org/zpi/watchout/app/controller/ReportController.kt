package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.data.entity.Report
import org.zpi.watchout.service.ReportService
import org.zpi.watchout.service.dto.RatingRequestDTO
import org.zpi.watchout.service.dto.ReportRequestDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Report Controller", description = "Endpoints for managing reports")
class ReportController(val reportService: ReportService) {

    @PostMapping
    @Operation(summary = "Create a new report about a comment or a event", description = "Endpoint to create a new report for a comment or an event. reportedObject should be either 'COMMENT' or 'EVENT' (its skill issue on my side but i dont care lol).")
    fun createReport(@RequestBody report: ReportRequestDTO): Report {
        logger.info { "Creating report: $report" }
        val result = reportService.createReport(report)
        logger.info { "Report created successfully" }
        return result
    }
}