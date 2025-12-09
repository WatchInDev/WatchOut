package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.ReputationService
import java.time.LocalDateTime
import java.time.Duration
import java.util.*
import org.zpi.watchout.data.entity.*


class ReputationServiceTest {

    private lateinit var userRepository: UserRepository
    private lateinit var eventRepository: EventRepository
    private lateinit var commentRepository: CommentRepository
    private lateinit var service: ReputationService

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        eventRepository = mockk()
        commentRepository = mockk()
        service = ReputationService(userRepository, eventRepository, commentRepository)
    }

    // ------------------------------------------------------------
    // calculateGlobalEventAccuracy
    // ------------------------------------------------------------
    @Test
    fun `calculateGlobalEventAccuracy should return 0 when no events exist`() {
        every { eventRepository.findByAuthor() } returns emptyList()

        val result = service.calculateGlobalEventAccuracy()

        assertEquals(0.0, result)
    }

    @Test
    fun `calculateGlobalEventAccuracy should return average rating`() {
        val events = listOf(
            mockk<Event> { every { rating } returns 0.6 },
            mockk<Event> { every { rating } returns 0.8 }
        )

        every { eventRepository.findByAuthor() } returns events

        val result = service.calculateGlobalEventAccuracy()

        assertEquals(0.7, result)
    }

    // ------------------------------------------------------------
    // calculateGlobalCommentAccuracy
    // ------------------------------------------------------------
    @Test
    fun `calculateGlobalCommentAccuracy should return 0 when no comments exist`() {
        every { commentRepository.findByAuthor() } returns emptyList()

        val result = service.calculateGlobalCommentAccuracy()

        assertEquals(0.0, result)
    }

    @Test
    fun `calculateGlobalCommentAccuracy should return average comment rating`() {
        val comments = listOf(
            mockk<Comment> { every { rating } returns 0.2 },
            mockk<Comment> { every { rating } returns 0.4 }
        )

        every { commentRepository.findByAuthor() } returns comments

        val result = service.calculateGlobalCommentAccuracy()

        assertEquals(0.3, result)
    }

    // ------------------------------------------------------------
    // calculateReputation (indirectly tests community trust + event + comment)
    // ------------------------------------------------------------
    @Test
    fun `calculateReputation should calculate clamped reputation`() {
        val userId = 10L

        val user = mockk<User>()
        every { user.createdAt } returns LocalDateTime.now().minusDays(40)  // max trust
        every { userRepository.findById(userId) } returns Optional.of(user)

        // Events
        val event = mockk<Event>()
        every { event.rating } returns 1.0
        every { event.reportedDate } returns LocalDateTime.now().minusDays(1)

        every { eventRepository.findByAuthor(userId) } returns listOf(event)

        // Comments
        val comment = mockk<Comment>()
        every { comment.rating } returns 1.0
        every { comment.createdAt } returns LocalDateTime.now().minusDays(1)

        every { commentRepository.findByAuthor(userId) } returns listOf(comment)

        val result = service.calculateReputation(
            userId,
            globalEventAccuracy = 0.7,
            globalCommentAccuracy = 0.8
        )

        assertTrue(result in 0.0..1.0)
    }

    @Test
    fun `calculateReputation should return default reputation for new user`() {
        val userId = 20L

        val user = mockk<User>()
        every { user.createdAt } returns LocalDateTime.now()  // zero days

        every { userRepository.findById(userId) } returns Optional.of(user)
        every { eventRepository.findByAuthor(userId) } returns emptyList()
        every { commentRepository.findByAuthor(userId) } returns emptyList()

        val result = service.calculateReputation(userId, 0.5, 0.5)

        assertEquals(ReputationService.DEFAULT_REPUTATION, result)
    }

    // ------------------------------------------------------------
    // isAbleToPostEvents
    // ------------------------------------------------------------
    @Test
    fun `isAbleToPostEvents should allow when no events created today`() {
        val userId = 1L
        val user = mockk<User>()
        every { user.reputation } returns 0.3

        every { userRepository.findById(userId) } returns Optional.of(user)

        val oldEvent = mockk<Event>()
        every { oldEvent.reportedDate } returns LocalDateTime.now().minusDays(2)

        every { eventRepository.findByAuthor(userId) } returns listOf(oldEvent)

        assertTrue(service.isAbleToPostEvents(userId))
    }

    @Test
    fun `isAbleToPostEvents should deny when limit reached and reputation low`() {
        val userId = 1L
        val user = mockk<User>()
        every { user.reputation } returns 0.3  // below threshold

        every { userRepository.findById(userId) } returns Optional.of(user)

        val todayEvent = mockk<Event>()
        every { todayEvent.reportedDate } returns LocalDateTime.now().minusHours(1)

        every { eventRepository.findByAuthor(userId) } returns listOf(todayEvent, todayEvent)

        assertFalse(service.isAbleToPostEvents(userId))
    }

    @Test
    fun `isAbleToPostEvents should allow despite limit when reputation high`() {
        val userId = 1L
        val user = mockk<User>()
        every { user.reputation } returns 0.5  // above threshold

        every { userRepository.findById(userId) } returns Optional.of(user)

        val todayEvent = mockk<Event>()
        every { todayEvent.reportedDate } returns LocalDateTime.now().minusHours(1)

        every { eventRepository.findByAuthor(userId) } returns listOf(todayEvent, todayEvent)

        assertTrue(service.isAbleToPostEvents(userId))
    }

    // ------------------------------------------------------------
    // isAbleToPostComments
    // ------------------------------------------------------------
    @Test
    fun `isAbleToPostComments should allow when no comments created today`() {
        val userId = 2L
        val user = mockk<User>()
        every { user.reputation } returns 0.1

        every { userRepository.findById(userId) } returns Optional.of(user)

        val oldComment = mockk<Comment>()
        every { oldComment.createdAt } returns LocalDateTime.now().minusDays(3)

        every { commentRepository.findByAuthor(userId) } returns listOf(oldComment)

        assertTrue(service.isAbleToPostComments(userId))
    }

    @Test
    fun `isAbleToPostComments should deny when limit reached and reputation low`() {
        val userId = 2L
        val user = mockk<User>()
        every { user.reputation } returns 0.1 // below threshold

        every { userRepository.findById(userId) } returns Optional.of(user)

        val todayComment = mockk<Comment>()
        every { todayComment.createdAt } returns LocalDateTime.now().minusHours(1)

        every { commentRepository.findByAuthor(userId) } returns listOf(todayComment, todayComment)

        assertFalse(service.isAbleToPostComments(userId))
    }

    @Test
    fun `isAbleToPostComments should allow despite limit when reputation high`() {
        val userId = 2L
        val user = mockk<User>()
        every { user.reputation } returns 0.3 // above threshold

        every { userRepository.findById(userId) } returns Optional.of(user)

        val todayComment = mockk<Comment>()
        every { todayComment.createdAt } returns LocalDateTime.now().minusHours(1)

        every { commentRepository.findByAuthor(userId) } returns listOf(todayComment, todayComment)

        assertTrue(service.isAbleToPostComments(userId))
    }
}
