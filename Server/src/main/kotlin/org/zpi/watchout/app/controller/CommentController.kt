package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
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
    fun addComment(@RequestBody @Valid commentRequestDto: CommentRequestDTO, @PathVariable("eventId") eventId: Long, @Parameter(hidden = true) @AuthenticationPrincipal userId : Long): CommentResponseDTO {
        logger.info { "Adding comment to event with id: ${eventId}" }
        val comment = commentService.addCommentToEvent(commentRequestDto, eventId, userId)
        logger.info { "Added comment with id: ${comment.id}" }
        return comment
    }

    @GetMapping
    @Operation(summary = "Get all comments for an event", description = "Pagination description: page - page number (0-based), size - number of comments per page(default is 20), sort - sorting criteria in the format: property,(asc|desc). Default sort order is ascending. Multiple sort criteria are supported." +
            " Example: http://localhost:8080/api/v1/events/2006/comments?page=30&size=10&sort=id,asc")
    fun getComments(@PathVariable("eventId") eventId: Long, @Parameter(hidden = true) @AuthenticationPrincipal userId : Long, @PageableDefault(size = 20) pageable: Pageable): Page<CommentResponseDTO> {
        logger.info { "Fetching comments for event with id: $eventId" }
        val comments = commentService.getCommentsByEventId(eventId, userId, pageable)
        logger.info { "Fetched ${comments.size} comments for event with id: $eventId" }
        return comments
    }

    @DeleteMapping("/{commentId}")
    @Operation(summary = "Delete a comment from an event", description = "Delete a comment made by the authenticated user from the specified event.")
    fun deleteComment(@PathVariable("eventId") eventId: Long, @Parameter(hidden = true) @AuthenticationPrincipal userId : Long, @PathVariable("commentId") commentId: Long) {
        logger.info { "Deleting comment with id: $commentId for event with id: $eventId by user with id: $userId" }
        commentService.deleteComment(commentId, userId)
        logger.info { "Deleted comment with id: $commentId for event with id: $eventId by user with id: $userId" }
    }
}