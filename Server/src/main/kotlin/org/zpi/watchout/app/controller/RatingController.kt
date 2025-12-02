package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.service.RatingService
import org.zpi.watchout.service.dto.RatingRequestDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/events/{eventId}")
@Tag(name = "Ratings", description = "Ratings on events and comments")
class RatingController(private val ratingService: RatingService) {

    @PostMapping("/ratings")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation(summary = "Upsert a rating",
        description = "Create or update a rating for an event. If the user has already rated the event, the existing rating will be updated with the new value. The rating value can be only be 1 (like) or -1 (dislike).")
    fun rateEvent(
        @PathVariable("eventId") eventId: Long,
        @RequestBody @Valid ratingRequestDTO: RatingRequestDTO,
        @Parameter(hidden = true) @AuthenticationPrincipal userId : Long
    ){
        logger.info { "Rating event with id: $eventId" }
        ratingService.upsertEventRating(userId, eventId, ratingRequestDTO)
        logger.info { "Rated event with id: $eventId" }
    }

    @PostMapping("/comments/{commentId}/ratings")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation(summary = "Upsert a rating",
        description = "Create or update a rating for an comment. If the user has already rated the comment, the existing rating will be updated with the new value. The rating value can be only be 1 (like) or -1 (dislike).")
    fun rateComment(
        @PathVariable("commentId") commentId: Long,
        @PathVariable("eventId") eventId: Long,
        @RequestBody @Valid ratingRequestDTO: RatingRequestDTO,
        @Parameter(hidden = true) @AuthenticationPrincipal userId : Long
    ){
        logger.info { "Rating comment with id: $commentId" }
        ratingService.upsertCommentRating(userId, commentId, eventId, ratingRequestDTO)
        logger.info { "Rated comment with id: $commentId" }
    }

    @DeleteMapping("/ratings")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation (summary = "Delete an event rating",
        description = "Delete a rating for an event made by the user.")
    fun deleteEventRating(
        @PathVariable("eventId") eventId: Long,
        @Parameter(hidden = true) @AuthenticationPrincipal userId : Long
    ){
        logger.info { "Deleting rating for event with id: $eventId" }
        ratingService.deleteEventRating(userId, eventId)
        logger.info { "Deleted rating for event with id: $eventId" }
    }

    @DeleteMapping("/comments/{commentId}/ratings")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation (summary = "Delete a comment rating",
        description = "Delete a rating for a comment made by the user.")
    fun deleteCommentRating(
        @PathVariable("commentId") commentId: Long,
        @Parameter(hidden = true) @AuthenticationPrincipal userId : Long
    ){
        logger.info { "Deleting rating for comment with id: $commentId" }
        ratingService.deleteCommentRating(userId, commentId)
        logger.info { "Deleted rating for comment with id: $commentId" }
    }



}