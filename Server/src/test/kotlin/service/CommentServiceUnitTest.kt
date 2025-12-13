package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.EventType
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
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.zpi.watchout.service.dto.AuthorResponseDTO
import java.time.LocalDateTime
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
        unmockkAll()

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

    @Test
    fun `getCommentsByEventId returns page from repository`() {
        val pageable = mockk<Pageable>(relaxed = true)
        val expected = PageImpl<CommentResponseDTO>(listOf())
        every { commentRepository.findByEventId(1L, 2L, pageable) } returns expected

        val result = service.getCommentsByEventId(1L, 2L, pageable)

        assertEquals(expected, result)
    }

    @Test
    fun `addCommentToEvent throws when user cannot post comments`() {
        val dto = CommentRequestDTO(content = "Hello", latitude = 1.0, longitude = 2.0)

        every { reputationService.isAbleToPostComments(5L) } returns false

        assertThrows(AccessDeniedException::class.java) {
            service.addCommentToEvent(dto, eventId = 10L, userId = 5L)
        }
    }

    @Test
    fun `addCommentToEvent throws when user is not within event distance`() {
        val dto = CommentRequestDTO(content = "Hi", latitude = 1.0, longitude = 2.0)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns false

        assertThrows(IllegalArgumentException::class.java) {
            service.addCommentToEvent(dto, eventId = 10L, userId = 5L)
        }
    }

    @Test
    fun `addCommentToEvent throws when event not found`() {
        val dto = CommentRequestDTO(content = "Test", latitude = 1.0, longitude = 2.0)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns true
        every { eventRepository.findById(10L) } returns Optional.empty()

        assertThrows(EntityNotFoundException::class.java) {
            service.addCommentToEvent(dto, eventId = 10L, userId = 5L)
        }
    }

    @Test
    fun `addCommentToEvent triggers notification when author preference notifyOnComment is true`() {
        val dto = CommentRequestDTO(content = "ok", latitude = 1.0, longitude = 2.0)

        val author = createUser(100L)
        val event = createEvent(10L, "Storm", author)

        val comment = createComment(content = "ok", author = author, eventId = 10L)
        val saved = createComment(50L, "ok", author, 10L)
        val mappedDto = createCommentResponseDTO(50L, "ok", 5L)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns true
        every { eventRepository.findById(10L) } returns Optional.of(event)

        every { globalPrefRepo.findByUserId(100L) } returns
                UserGlobalPreference(userId = 100L, notifyOnComment = true)

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
        val dto = CommentRequestDTO(content = "ok", latitude = 1.0, longitude = 2.0)

        val author = createUser(100L)
        val event = createEvent(10L, "Storm", author)

        val comment = createComment(content = "ok", author = author, eventId = 10L)
        val saved = createComment(40L, "ok", author, 10L)
        val mappedDto = createCommentResponseDTO(40L, "ok", 5L)

        every { reputationService.isAbleToPostComments(5L) } returns true
        every { geoService.isUserWithinDistanceByEventId(10L, 1.0, 2.0) } returns true
        every { eventRepository.findById(10L) } returns Optional.of(event)

        every { globalPrefRepo.findByUserId(100L) } returns
                UserGlobalPreference(userId = 100L, notifyOnComment = false)

        every { commentMapper.mapToEntity(dto, 5L, 10L) } returns comment
        every { commentRepository.save(comment) } returns saved
        every { commentMapper.mapToDto(saved) } returns mappedDto

        val result = service.addCommentToEvent(dto, 10L, 5L)

        assertEquals(mappedDto, result)
        verify(exactly = 0) { notificationService.createNotification(any(), any(), any()) }
    }

    @Test
    fun `deleteComment throws if comment does not exist`() {
        every { commentRepository.findById(99L) } returns Optional.empty()

        assertThrows(EntityNotFoundException::class.java) {
            service.deleteComment(99L, 5L)
        }
    }

    @Test
    fun `deleteComment throws when comment does not belong to user`() {
        val author = createUser(123L)
        val comment = createComment(10L, "text", author, 1L)
        every { commentRepository.findById(10L) } returns Optional.of(comment)

        assertThrows(AccessDeniedException::class.java) {
            service.deleteComment(10L, 5L)
        }
    }

    @Test
    fun `deleteComment marks comment as deleted and saves it`() {
        val author = createUser(5L)
        val comment = createComment(10L, "text", author, 1L).apply { isDeleted = false }

        every { commentRepository.findById(10L) } returns Optional.of(comment)
        every { commentRepository.save(any()) } returnsArgument 0

        service.deleteComment(10L, 5L)

        assertTrue(comment.isDeleted)
        verify { commentRepository.save(comment) }
    }

    private fun createUser(id: Long) = User(
        name = "User$id",
        email = "user$id@example.com",
        externalId = "ext$id",
        reputation = 1.0
    ).apply { this.id = id }

    private fun createEvent(id: Long, name: String, author: User) = Event(
        name = name,
        description = "Description",
        image = "",
        reportedDate = LocalDateTime.now(),
        endDate = LocalDateTime.now().plusDays(1),
        isActive = true,
        eventType = mockk<EventType>(relaxed = true),
        author = author,
        location = GeometryFactory().createPoint((Coordinate(30.0,30.0))).also{
            it.srid = 4326
        }
    ).apply { this.id = id }

    private fun createComment(id: Long? = null, content: String, author: User, eventId: Long) =
        Comment(content = content, author = author, eventId = eventId).apply {
            id?.let { this.id = it }
        }

    private fun createCommentResponseDTO(id: Long, content: String, authorId: Long) =
        CommentResponseDTO(
            id = id,
            content = content,
            eventId = 10L,
            createdAt = LocalDateTime.now(),
            author = AuthorResponseDTO(id = authorId, reputation = 0.0),
            rating = 0.0,
            ratingForCurrentUser = 0.0,
            isAuthor = true
        )
}