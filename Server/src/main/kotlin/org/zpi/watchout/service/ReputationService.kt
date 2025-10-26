package org.zpi.watchout.service

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.CommentRatingRepository
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRatingRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserRepository
import java.lang.Math.pow
import java.time.Duration
import java.time.LocalDateTime
import kotlin.math.min
import kotlin.math.pow

@Service
class ReputationService(private val userRepository: UserRepository, private val eventRepository: EventRepository, private val commentRepository: CommentRepository) {

    companion object {
        const val MAX_REPUTATION = 1.0
        const val MIN_REPUTATION = 0.0
        const val MINIMAL_EVENT_REPUTATION = 0.1
        const val MINIMAL_COMMENT_REPUTATION = 0.05
        const val MINIMAL_LIKE_REPUTATION = 0.02
        const val COMMUNITY_TRUST_FACTOR = 0.5
        const val EVENT_IMPACT_FACTOR = 0.3
        const val COMMENT_IMPACT_FACTOR = 0.2
        const val MAX_DAYS_FOR_COMMUNITY_TRUST = 30
        const val BAYESIAN_SMOOTHING_FACTOR = 5
        const val EVENT_CAP = 10
        const val EVENT_BONUS = 2.0
        const val EVENT_WEIGHT_DECAY = 0.99
        const val COMMENT_WEIGHT_DECAY = 0.98
    }

    private fun calculateEventParameter(userId: Long, globalAverageAccuracy: Double): Double {
        val userEvents = eventRepository.findByAuthor(userId)
        if (userEvents.isEmpty()) return 0.0

        val totalReputation = userEvents.sumOf { event ->
            event.rating * EVENT_WEIGHT_DECAY.pow(Duration.between(event.reportedDate, LocalDateTime.now()).toDays().toDouble())
        }

        val adjustedAccuracy = (totalReputation + BAYESIAN_SMOOTHING_FACTOR * globalAverageAccuracy) / (userEvents.size + BAYESIAN_SMOOTHING_FACTOR)
        return adjustedAccuracy * min(userEvents.size.toDouble() / EVENT_CAP, EVENT_BONUS)
    }


    private fun calculateCommentParameter(userId: Long, globalAverageAccuracy: Double): Double {
        val userComments = commentRepository.findByAuthor(userId)
        if (userComments.isEmpty()) return 0.0

        val totalReputation = userComments.sumOf { comment ->
            comment.rating * COMMENT_WEIGHT_DECAY.pow(Duration.between(comment.createdAt, LocalDateTime.now()).toDays().toDouble())
        }

        val adjustedAccuracy = (totalReputation + BAYESIAN_SMOOTHING_FACTOR * globalAverageAccuracy) / (userComments.size + BAYESIAN_SMOOTHING_FACTOR)
        return adjustedAccuracy
    }

    private fun calculateCommunityTrust(userId: Long): Double {
        val user = userRepository.findById(userId).orElseThrow()
        return min(Duration.between(user.createdAt, LocalDateTime.now()).toDays().toDouble()/MAX_DAYS_FOR_COMMUNITY_TRUST, 1.0)
    }

    fun calculateGlobalEventAccuracy(): Double {
        val events = eventRepository.findByAuthor()
        if (events.isEmpty()) return 0.0
        val totalAccuracy = events.sumOf { it.rating }
        return totalAccuracy / events.size
    }

    fun calculateGlobalCommentAccuracy(): Double {
        val comments = commentRepository.findByAuthor()
        if (comments.isEmpty()) return 0.0
        val totalAccuracy = comments.sumOf { it.rating }
        return totalAccuracy / comments.size
    }

    fun calculateReputation(userId: Long, globalEventAccuracy: Double, globalCommentAccuracy: Double): Double {
        val communityTrust = calculateCommunityTrust(userId)
        val eventParameter = calculateEventParameter(userId, globalEventAccuracy)
        val commentParameter = calculateCommentParameter(userId, globalCommentAccuracy)

        val reputation = 0.25 + (COMMUNITY_TRUST_FACTOR * communityTrust) +
                (EVENT_IMPACT_FACTOR * eventParameter) +
                (COMMENT_IMPACT_FACTOR * commentParameter)

        return reputation.coerceIn(MIN_REPUTATION, MAX_REPUTATION)
    }






}