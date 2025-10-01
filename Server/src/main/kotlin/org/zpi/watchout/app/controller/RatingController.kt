package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
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
    @Operation(summary = "Upsert a rating",
        description = "Create or update a rating for an event. If the user has already rated the event, the existing rating will be updated with the new value. The rating value can be only be 1 (like) or -1 (dislike).")
    fun rateEvent(
        @PathVariable("eventId") eventId: Long,
        @RequestBody @Valid ratingRequestDTO: RatingRequestDTO
    ){
        logger.info { "Rating event with id: $eventId" }
        ratingService.upsertEventRating(1,eventId, ratingRequestDTO.rating)
        logger.info { "Rated event with id: $eventId" }
    }

    @PostMapping("/comments/{commentId}/ratings")
    @Operation(summary = "Upsert a rating",
        description = "Create or update a rating for an comment. If the user has already rated the comment, the existing rating will be updated with the new value. The rating value can be only be 1 (like) or -1 (dislike).")
    fun rateComment(
        @PathVariable("commentId") commentId: Long,
        @RequestBody @Valid ratingRequestDTO: RatingRequestDTO
    ){
        logger.info { "Rating comment with id: $commentId" }
        ratingService.upsertCommentRating(1,commentId, ratingRequestDTO.rating)
        logger.info { "Rated comment with id: $commentId" }
    }

    @DeleteMapping("/ratings")
    @Operation (summary = "Delete an event rating",
        description = "Delete a rating for an event made by the user.")
    fun deleteEventRating(
        @PathVariable("eventId") eventId: Long
    ){
        logger.info { "Deleting rating for event with id: $eventId" }
        ratingService.deleteEventRating(1,eventId)
        logger.info { "Deleted rating for event with id: $eventId" }
    }

    @DeleteMapping("/comments/{commentId}/ratings")
    @Operation (summary = "Delete a comment rating",
        description = "Delete a rating for a comment made by the user.")
    fun deleteCommentRating(
        @PathVariable("commentId") commentId: Long
    ){
        logger.info { "Deleting rating for comment with id: $commentId" }
        ratingService.deleteCommentRating(1,commentId)
        logger.info { "Deleted rating for comment with id: $commentId" }
    }



}