package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.CommentService
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.dto.CommentResponseDTO


private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/events/{eventId}/comments")
@Tag(name = "Comments", description = "Comments on events")
class CommentController(private val commentService: CommentService) {

    @PostMapping
    @Operation(summary = "Add a comment to an event")
    fun addComment(@RequestBody @Valid commentRequestDto: CommentRequestDTO, @PathVariable("eventId") eventId: Long): CommentResponseDTO {
        logger.info { "Adding comment to event with id: ${eventId}" }
        val comment = commentService.addCommentToEvent(commentRequestDto, eventId)
        logger.info { "Added comment with id: ${comment.id}" }
        return comment
    }

    @GetMapping
    @Operation(summary = "Get all comments for an event")
    fun getComments(@PathVariable("eventId") eventId: Long): List<CommentResponseDTO> {
        logger.info { "Fetching comments for event with id: $eventId" }
        val comments = commentService.getCommentsByEventId(eventId)
        logger.info { "Fetched ${comments.size} comments for event with id: $eventId" }
        return comments
    }
}