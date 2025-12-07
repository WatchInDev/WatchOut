package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.util.*
import org.zpi.watchout.data.entity.*
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.EventTypeService
import org.zpi.watchout.service.mapper.EventTypeMapper
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.ReportRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.AdminService
import org.zpi.watchout.service.dto.AdminEventDTO
import org.zpi.watchout.service.dto.AdminEventFlatRow
import org.zpi.watchout.service.dto.EventTypeDTO
import org.zpi.watchout.service.dto.AdminCommentsDTO

class AdminServiceTest {

    private lateinit var userRepository: UserRepository
    private lateinit var commentRepository: CommentRepository
    private lateinit var eventRepository: EventRepository
    private lateinit var reportRepository: ReportRepository
    private lateinit var adminService: AdminService

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        commentRepository = mockk()
        eventRepository = mockk()
        reportRepository = mockk()
        adminService = AdminService(userRepository, commentRepository, eventRepository, reportRepository)
    }

    @Test
    fun `blockUser should block unblocked user`() {
        val userId = 1L
        val user = mockk<User>(relaxed = true) {
            every { isBlocked } returns false
            every { isBlocked = true } just Runs
        }

        every { userRepository.findById(userId) } returns Optional.of(user)
        every { userRepository.save(user) } returns user

        adminService.blockUser(userId)

        verify { userRepository.findById(userId) }
        verify { userRepository.save(user) }
    }

    @Test
    fun `blockUser should throw EntityNotFoundException when user not found`() {
        val userId = 1L
        every { userRepository.findById(userId) } returns Optional.empty()

        assertThrows<EntityNotFoundException> {
            adminService.blockUser(userId)
        }
    }

    @Test
    fun `blockUser should throw IllegalArgumentException when user already blocked`() {
        val userId = 1L
        val user = mockk<User>(relaxed = true) {
            every { isBlocked } returns true
        }

        every { userRepository.findById(userId) } returns Optional.of(user)

        assertThrows<IllegalArgumentException> {
            adminService.blockUser(userId)
        }
    }

    @Test
    fun `unblockUser should unblock blocked user`() {
        val userId = 1L
        val user = mockk<User>(relaxed = true) {
            every { isBlocked } returns true
            every { isBlocked = false } just Runs
        }

        every { userRepository.findById(userId) } returns Optional.of(user)
        every { userRepository.save(user) } returns user

        adminService.unblockUser(userId)

        verify { userRepository.findById(userId) }
        verify { userRepository.save(user) }
    }

    @Test
    fun `unblockUser should throw EntityNotFoundException when user not found`() {
        val userId = 1L
        every { userRepository.findById(userId) } returns Optional.empty()

        assertThrows<EntityNotFoundException> {
            adminService.unblockUser(userId)
        }
    }

    @Test
    fun `unblockUser should throw IllegalArgumentException when user not blocked`() {
        val userId = 1L
        val user = mockk<User>(relaxed = true) {
            every { isBlocked } returns false
        }

        every { userRepository.findById(userId) } returns Optional.of(user)

        assertThrows<IllegalArgumentException> {
            adminService.unblockUser(userId)
        }
    }

    @Test
    fun `getAllUsers should return mapped user DTOs`() {
        val users = listOf(mockk<User>(relaxed = true), mockk<User>(relaxed = true))
        every { userRepository.findAll() } returns users

        val result = adminService.getAllUsers()

        assertEquals(2, result.size)
        verify { userRepository.findAll() }
    }

    @Test
    fun `getAllBlockedUsers should return only blocked users`() {
        val blockedUser = mockk<User>(relaxed = true) { every { isBlocked } returns true }
        val unblockedUser = mockk<User>(relaxed = true) { every { isBlocked } returns false }
        val users = listOf(blockedUser, unblockedUser)
        every { userRepository.findAll() } returns users

        val result = adminService.getAllBlockedUsers()

        assertEquals(1, result.size)
        verify { userRepository.findAll() }
    }

    @Test
    fun `deleteComment should mark comment as deleted`() {
        val commentId = 1L
        val comment = mockk<Comment>(relaxed = true) {
            every { isDeleted } returns false
            every { isDeleted = true } just Runs
        }

        every { commentRepository.findById(commentId) } returns Optional.of(comment)
        every { commentRepository.save(comment) } returns comment

        adminService.deleteComment(commentId)

        verify { commentRepository.findById(commentId) }
        verify { commentRepository.save(comment) }
    }

    @Test
    fun `deleteComment should throw EntityNotFoundException when comment not found`() {
        val commentId = 1L
        every { commentRepository.findById(commentId) } returns Optional.empty()

        assertThrows<EntityNotFoundException> {
            adminService.deleteComment(commentId)
        }
    }

    @Test
    fun `deleteComment should throw IllegalArgumentException when comment already deleted`() {
        val commentId = 1L
        val comment = mockk<Comment>(relaxed = true) {
            every { isDeleted } returns true
        }

        every { commentRepository.findById(commentId) } returns Optional.of(comment)

        assertThrows<IllegalArgumentException> {
            adminService.deleteComment(commentId)
        }
    }

    @Test
    fun `deleteEvent should deactivate active event`() {
        val eventId = 1L
        val event = mockk<Event>(relaxed = true) {
            every { isActive } returns true
            every { isActive = false } just Runs
        }

        every { eventRepository.findById(eventId) } returns Optional.of(event)
        every { eventRepository.save(event) } returns event

        adminService.deleteEvent(eventId)

        verify { eventRepository.findById(eventId) }
        verify { eventRepository.save(event) }
    }

    @Test
    fun `deleteEvent should throw EntityNotFoundException when event not found`() {
        val eventId = 1L
        every { eventRepository.findById(eventId) } returns Optional.empty()

        assertThrows<EntityNotFoundException> {
            adminService.deleteEvent(eventId)
        }
    }

    @Test
    fun `deleteEvent should throw IllegalArgumentException when event already deactivated`() {
        val eventId = 1L
        val event = mockk<Event>(relaxed = true) {
            every { isActive } returns false
        }

        every { eventRepository.findById(eventId) } returns Optional.of(event)

        assertThrows<IllegalArgumentException> {
            adminService.deleteEvent(eventId)
        }
    }

    @Test
    fun `getAdminEvents should return mapped event DTOs`() {
        val eventData = mockk<AdminEventFlatRow>(relaxed = true) {
            every { eventId } returns 1L
            every { name } returns "Test Event"
            every { description } returns "Description"
            every { authorEmail } returns "test@email.com"
            every { authorId } returns 1L
            every { reportedDate } returns mockk { every { toLocalDateTime() } returns java.time.LocalDateTime.now() }
            every { endDate } returns mockk { every { toLocalDateTime() } returns java.time.LocalDateTime.now() }
            every { eventType } returns "Type"
            every { images } returns ""
            every { isActive } returns true
        }
        every { eventRepository.findAllEventsWithCommentsFlat() } returns listOf(eventData)

        val result = adminService.getAdminEvents()

        assertEquals(1, result.size)
        verify { eventRepository.findAllEventsWithCommentsFlat() }
    }

    @Test
    fun `getAdminEventById should return mapped event DTO`() {
        val eventData = mockk<AdminEventFlatRow>(relaxed = true) {
            every { eventId } returns 1L
            every { name } returns "Test Event"
            every { description } returns "Description"
            every { authorEmail } returns "test@email.com"
            every { authorId } returns 1L
            every { reportedDate } returns mockk { every { toLocalDateTime() } returns java.time.LocalDateTime.now() }
            every { endDate } returns mockk { every { toLocalDateTime() } returns java.time.LocalDateTime.now() }
            every { eventType } returns "Type"
            every { images } returns ""
            every { isActive } returns true
        }
        every { eventRepository.findEventById(1L) } returns listOf(eventData)

        val result = adminService.getAdminEventById(1L)

        assertNotNull(result)
        verify { eventRepository.findEventById(1L) }
    }

    @Test
    fun `getAdminEventsByAuthor should return events by author`() {
        val eventData = mockk<AdminEventFlatRow>(relaxed = true) {
            every { eventId } returns 1L
            every { name } returns "Test Event"
            every { description } returns "Description"
            every { authorEmail } returns "test@email.com"
            every { authorId } returns 1L
            every { reportedDate } returns mockk { every { toLocalDateTime() } returns java.time.LocalDateTime.now() }
            every { endDate } returns mockk { every { toLocalDateTime() } returns java.time.LocalDateTime.now() }
            every { eventType } returns "Type"
            every { images } returns ""
            every { isActive } returns true
        }
        every { eventRepository.findEventByUserId(1L) } returns listOf(eventData)

        val result = adminService.getAdminEventsByAuthor(1L)

        assertEquals(1, result.size)
        verify { eventRepository.findEventByUserId(1L) }
    }

    @Test
    fun `getAdminCommentsByAuthor should return comments by author`() {
        val comments = listOf(mockk<AdminCommentsDTO>())
        every { commentRepository.getAdminCommentsByAuthor(1L) } returns comments

        val result = adminService.getAdminCommentsByAuthor(1L)

        assertEquals(1, result.size)
        verify { commentRepository.getAdminCommentsByAuthor(1L) }
    }

    @Test
    fun `getAdminCommentsById should return comment by id`() {
        val comment = mockk<AdminCommentsDTO>()
        every { commentRepository.getAdminCommentById(1L) } returns comment

        val result = adminService.getAdminCommentsById(1L)

        assertEquals(comment, result)
        verify { commentRepository.getAdminCommentById(1L) }
    }

    @Test
    fun `getAdminCommentsById should throw EntityNotFoundException when comment not found`() {
        every { commentRepository.getAdminCommentById(1L) } returns null

        assertThrows<EntityNotFoundException> {
            adminService.getAdminCommentsById(1L)
        }
    }

    @Test
    fun `getAdminCommentByEventId should return comments by event id`() {
        val comments = listOf(mockk<AdminCommentsDTO>())
        every { commentRepository.getAdminCommentByEventId(1L) } returns comments

        val result = adminService.getAdminCommentByEventId(1L)

        assertEquals(1, result.size)
        verify { commentRepository.getAdminCommentByEventId(1L) }
    }

    @Test
    fun `getReportedEvents should return all reports`() {
        val reports = listOf(mockk<Report>())
        every { reportRepository.findAll() } returns reports

        val result = adminService.getReportedEvents()

        assertEquals(1, result.size)
        verify { reportRepository.findAll() }
    }

    @Test
    fun `getUserById should return user DTO`() {
        val user = mockk<User>(relaxed = true)
        every { userRepository.findById(1L) } returns Optional.of(user)

        val result = adminService.getUserById(1L)

        assertNotNull(result)
        verify { userRepository.findById(1L) }
    }

    @Test
    fun `getUserById should throw EntityNotFoundException when user not found`() {
        every { userRepository.findById(1L) } returns Optional.empty()

        assertThrows<EntityNotFoundException> {
            adminService.getUserById(1L)
        }
    }
}