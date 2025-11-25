package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.CommentRating
import org.zpi.watchout.data.repos.CommentRatingRepository
import org.zpi.watchout.data.repos.EventRatingRepository
import org.zpi.watchout.service.dto.RatingRequestDTO

@Service
class RatingService (private val commentRatingRepository: CommentRatingRepository, private val eventRatingRepository: EventRatingRepository, private val geoService: GeoService) {

    fun upsertCommentRating(userId: Long, commentId: Long, eventId: Long, ratingRequestDTO: RatingRequestDTO) {
        if (geoService.isUserWithinDistance(eventId, ratingRequestDTO.latitude, ratingRequestDTO.longitude)) {
            commentRatingRepository.upsertRating(userId, commentId, ratingRequestDTO.rating)
        }
    }

    fun upsertEventRating(userId: Long, eventId: Long, ratingRequestDTO: RatingRequestDTO) {
        if (geoService.isUserWithinDistance(eventId, ratingRequestDTO.latitude, ratingRequestDTO.longitude)) {
            eventRatingRepository.upsertRating(userId, eventId, ratingRequestDTO.rating)
        }
    }

    fun deleteCommentRating(userId: Long, commentId: Long) {
        commentRatingRepository.deleteByUserIdAndCommentId(userId, commentId)
    }

    fun deleteEventRating(userId: Long, eventId: Long) {
        eventRatingRepository.deleteByUserIdAndEventId(userId, eventId)
    }
}