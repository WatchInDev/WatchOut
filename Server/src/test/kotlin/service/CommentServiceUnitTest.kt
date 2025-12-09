package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.security.access.AccessDeniedException
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.entity.UserGlobalPreference
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.service.CommentService
import org.zpi.watchout.service.GeoService
import org.zpi.watchout.service.NotificationService
import org.zpi.watchout.service.NotificationType
import org.zpi.watchout.service.ReputationService
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.dto.CommentResponseDTO
import org.zpi.watchout.service.mapper.CommentMapper
import java.util.*

class CommentServiceTest {

    private lateinit var commentRepository: CommentRepository
    private lateinit var commentMapper: CommentMapper
    private lateinit var eventRepository: EventRepository
    private lateinit var geoService: GeoService
    private lateinit var globalPrefRepo: UserGlobalPreferenceRepository
    private lateinit var notificationService: NotificationService
    private lateinit var reputationService: ReputationService

    private lateinit var service: CommentService

    @BeforeEach
    fun setup() {
        // Clear previous mocks to avoid interference between tests
        unmockkAll()

        // Use relaxed mocks so unstubbed calls don't crash tests
        commentRepository = mockk(relaxed = true)
        commentMapper = mockk(relaxed = true)
        eventRepository = mockk(relaxed = true)
        geoService = mockk(relaxed = true)
        globalPrefRepo = mockk(relaxed = true)
        notificationService = mockk(relaxed = true)
        reputationService = mockk(relaxed = true)

        service = CommentService(
            commentRepository,
            commentMapper,
            eventRepository,
            geoService,
            globalPrefRepo,
            notificationService,
            reputationService
        )
    }

    // -------------------------------------------------------------------------
    // getCommentsByEventId
    // -------------------------------------------------------------------------

    @Test
    fun `getCommentsByEventId returns page from repository`() {
        val pageable = mockk<Pageable>(relaxed = true)
        val expected = PageImpl<CommentResponseDTO>(listOf())
        every { commentRepository.findByEventId(1L, 2L, pageable) } returns expected

        val result = service.getCommentsByEventId(1L, 2L, pageable)

        assertEquals(expected, result)
    }

    // -------------------------------------------------------------------------
    // addCommentToEvent
    // -------------------------------------------------------------------------

    @Test
    fun `addCommentToEvent throws when user cannot post comments`() {
        val dto = CommentRequestDTO(text = "Hello", latitude = 1.0, longitude = 2.0)

        every { reputationService.isAbleToPostComments(5L) } returns false

        assertThrows(AccessDeniedException::class.java) {
            service.addCommentToEvent(dto, eventId = 10L, userId = 5L)
        }
    }

    @Test
    fun `addCommentToEvent throws when user is not within event distance`() {
        val dto = CommentRequestDTO(text = "Hi", latitude = 1.0, longitude = 2.0)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns false

        assertThrows(IllegalArgumentException::class.java) {
            service.addCommentToEvent(dto, eventId = 10L, userId = 5L)
        }
    }

    @Test
    fun `addCommentToEvent throws when event not found`() {
        val dto = CommentRequestDTO(text = "Test", latitude = 1.0, longitude = 2.0)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns true
        every { eventRepository.findById(10L) } returns Optional.empty()

        assertThrows(EntityNotFoundException::class.java) {
            service.addCommentToEvent(dto, eventId = 10L, userId = 5L)
        }
    }

    @Test
    fun `addCommentToEvent triggers notification when author preference notifyOnComment is true`() {
        val dto = CommentRequestDTO("ok", 1.0, 2.0)

        val author = User(id = 100L, reputation = 1.0)
        val event = Event(id = 10L, name = "Storm", author = author)

        val comment = Comment()
        val saved = Comment(id = 50L)
        val mappedDto = CommentResponseDTO(id = 50L, text = "ok", authorId = 5L)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns true
        every { eventRepository.findById(10L) } returns Optional.of(event)

        every { globalPrefRepo.findByUserId(100L) } returns
                UserGlobalPreference(notifyOnComment = true)

        every { commentMapper.mapToEntity(dto, authorId = 5L, eventId = 10L) } returns comment
        every { commentRepository.save(comment) } returns saved
        every { commentMapper.mapToDto(saved) } returns mappedDto

        every { notificationService.createNotification(NotificationType.COMMENT, 100L, "Storm") } just Runs

        val result = service.addCommentToEvent(dto, 10L, 5L)

        assertEquals(mappedDto, result)
        verify { notificationService.createNotification(NotificationType.COMMENT, 100L, "Storm") }
    }

    @Test
    fun `addCommentToEvent does NOT notify when notifyOnComment is false`() {
        val dto = CommentRequestDTO("ok", 1.0, 2.0)

        val author = User(id = 100L, reputation = 1.0)
        val event = Event(id = 10L, name = "Storm", author = author)

        val comment = Comment()
        val saved = Comment(id = 40L)
        val mappedDto = CommentResponseDTO(id = 40L, text = "ok", authorId = 5L)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns true
        every { eventRepository.findById(10L) } returns Optional.of(event)

        every { globalPrefRepo.findByUserId(100L) } returns
                UserGlobalPreference(notifyOnComment = false)

        every { commentMapper.mapToEntity(dto, 5L, 10L) } returns comment
        every { commentRepository.save(comment) } returns saved
        every { commentMapper.mapToDto(saved) } returns mappedDto

        val result = service.addCommentToEvent(dto, 10L, 5L)

        assertEquals(mappedDto, result)
        verify(exactly = 0) { notificationService.createNotification(any(), any(), any()) }
    }

    // -------------------------------------------------------------------------
    // deleteComment
    // -------------------------------------------------------------------------

    @Test
    fun `deleteComment throws if comment does not exist`() {
        every { commentRepository.findById(99L) } returns Optional.empty()

        assertThrows(EntityNotFoundException::class.java) {
            service.deleteComment(99L, 5L)
        }
    }

    @Test
    fun `deleteComment throws when comment does not belong to user`() {
        val comment = Comment(id = 10L, author = User(id = 123L))
        every { commentRepository.findById(10L) } returns Optional.of(comment)

        assertThrows(AccessDeniedException::class.java) {
            service.deleteComment(10L, 5L)
        }
    }

    @Test
    fun `deleteComment marks comment as deleted and saves it`() {
        val comment = Comment(id = 10L, author = User(id = 5L), isDeleted = false)

        every { commentRepository.findById(10L) } returns Optional.of(comment)
        every { commentRepository.save(any()) } returnsArgument 0

        service.deleteComment(10L, 5L)

        assertTrue(comment.isDeleted)
        verify { commentRepository.save(comment) }
    }
}
