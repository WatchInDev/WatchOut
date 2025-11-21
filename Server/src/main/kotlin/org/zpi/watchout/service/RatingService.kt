package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.CommentRating
import org.zpi.watchout.data.repos.CommentRatingRepository
import org.zpi.watchout.data.repos.EventRatingRepository

@Service
class RatingService (private val commentRatingRepository: CommentRatingRepository, private val eventRatingRepository: EventRatingRepository, private val geoService: GeoService) {

    fun upsertCommentRating(userId: Long, commentId: Long, ratingValue: Int, eventId: Long, userLat: Double, userLng: Double) {
        if (geoService.isUserWithinDistance(eventId, userLat, userLng)) {
            commentRatingRepository.upsertRating(userId, commentId, ratingValue)
        }
    }

    fun upsertEventRating(userId: Long, eventId: Long, ratingValue: Int, userLat: Double, userLng: Double) {
        if (geoService.isUserWithinDistance(eventId, userLat, userLng)) {
            eventRatingRepository.upsertRating(userId, eventId, ratingValue)
        }
    }

    fun deleteCommentRating(userId: Long, commentId: Long) {
        commentRatingRepository.deleteByUserIdAndCommentId(userId, commentId)
    }

    fun deleteEventRating(userId: Long, eventId: Long) {
        eventRatingRepository.deleteByUserIdAndEventId(userId, eventId)
    }
}