package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.zpi.watchout.data.repos.CommentRatingRepository
import org.zpi.watchout.data.repos.EventRatingRepository
import org.zpi.watchout.service.GeoService
import org.zpi.watchout.service.RatingService
import org.zpi.watchout.service.dto.RatingRequestDTO

class RatingServiceTest {

    private lateinit var commentRatingRepository: CommentRatingRepository
    private lateinit var eventRatingRepository: EventRatingRepository
    private lateinit var geoService: GeoService

    private lateinit var ratingService: RatingService

    @BeforeEach
    fun setUp() {
        commentRatingRepository = mockk()
        eventRatingRepository = mockk()
        geoService = mockk()

        ratingService = RatingService(
            commentRatingRepository,
            eventRatingRepository,
            geoService
        )
    }

    // ---------------------------------------------------------
    // upsertCommentRating
    // ---------------------------------------------------------

    @Test
    fun `upsertCommentRating should call repository upsertRating`() {
        val userId = 1L
        val commentId = 2L
        val eventId = 3L
        val request = RatingRequestDTO(rating = 5, latitude = 51.0, longitude = 19.0)

        every { commentRatingRepository.upsertRating(userId, commentId, 5) } just Runs

        ratingService.upsertCommentRating(userId, commentId, eventId, request)

        verify { commentRatingRepository.upsertRating(userId, commentId, 5) }
    }

    // ---------------------------------------------------------
    // upsertEventRating
    // ---------------------------------------------------------

    @Test
    fun `upsertEventRating should call repository upsertRating when user within distance`() {
        val userId = 1L
        val eventId = 20L
        val request = RatingRequestDTO(rating = 4, latitude = 50.0, longitude = 18.0)

        every { geoService.isUserWithinDistanceByEventId(eventId, 50.0, 18.0) } returns true
        every { eventRatingRepository.upsertRating(userId, eventId, 4) } just Runs

        ratingService.upsertEventRating(userId, eventId, request)

        verify { eventRatingRepository.upsertRating(userId, eventId, 4) }
    }

    @Test
    fun `upsertEventRating should throw IllegalArgumentException when user outside distance`() {
        val userId = 1L
        val eventId = 20L
        val request = RatingRequestDTO(rating = 3, latitude = 40.0, longitude = 10.0)

        every { geoService.isUserWithinDistanceByEventId(eventId, 40.0, 10.0) } returns false

        assertThrows(IllegalArgumentException::class.java) {
            ratingService.upsertEventRating(userId, eventId, request)
        }

        verify(exactly = 0) {
            eventRatingRepository.upsertRating(any(), any(), any())
        }
    }

    // ---------------------------------------------------------
    // deleteCommentRating
    // ---------------------------------------------------------

    @Test
    fun `deleteCommentRating should call repository delete`() {
        val userId = 1L
        val commentId = 2L

        every { commentRatingRepository.deleteByUserIdAndCommentId(userId, commentId) } just Runs

        ratingService.deleteCommentRating(userId, commentId)

        verify { commentRatingRepository.deleteByUserIdAndCommentId(userId, commentId) }
    }

    // ---------------------------------------------------------
    // deleteEventRating
    // ---------------------------------------------------------

    @Test
    fun `deleteEventRating should call repository delete`() {
        val userId = 1L
        val eventId = 20L

        every { eventRatingRepository.deleteByUserIdAndEventId(userId, eventId) } just Runs

        ratingService.deleteEventRating(userId, eventId)

        verify { eventRatingRepository.deleteByUserIdAndEventId(userId, eventId) }
    }
}
