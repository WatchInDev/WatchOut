package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.Report
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.ReportRepository
import org.zpi.watchout.service.ReportService
import org.zpi.watchout.service.dto.ReportRequestDTO
import java.util.*

class ReportServiceTest {

    private lateinit var reportRepository: ReportRepository
    private lateinit var commentRepository: CommentRepository
    private lateinit var eventRepository: EventRepository
    private lateinit var reportService: ReportService

    @BeforeEach
    fun setup() {
        reportRepository = mockk()
        commentRepository = mockk()
        eventRepository = mockk()

        reportService = ReportService(reportRepository, commentRepository, eventRepository)
    }

    // ---------------------------------------------------------------
    // COMMENT REPORTS
    // ---------------------------------------------------------------
    @Test
    fun `createReport should create report for COMMENT`() {
        val dto = ReportRequestDTO(
            reporterId = 1L,
            reportedObjectId = 10L,
            reportedObject = "COMMENT",
            reason = "Spam"
        )

        val author = mockk<User> { every { id } returns 99L }

        // Create the comment mock first, then stub its author property
        val comment = mockk<Comment>(relaxed = true)
        every { comment.author } returns author

        every { commentRepository.findById(10L) } returns Optional.of(comment)

        val savedReport = mockk<Report>()
        every { reportRepository.save(any()) } returns savedReport

        val result = reportService.createReport(dto)

        verify {
            reportRepository.save(
                match {
                    it.reportedUserId == 99L &&
                            it.reportedObjectId == 10L &&
                            it.reportedObject == "COMMENT" &&
                            it.reason == "Spam" &&
                            it.reporterId == 1L
                }
            )
        }

        assertEquals(savedReport, result)
    }

    @Test
    fun `createReport should throw when COMMENT not found`() {
        every { commentRepository.findById(10L) } returns Optional.empty()

        val dto = ReportRequestDTO(
            reporterId = 1L,
            reportedObjectId = 10L,
            reportedObject = "COMMENT",
            reason = "Spam"
        )

        assertThrows(EntityNotFoundException::class.java) {
            reportService.createReport(dto)
        }
    }


    // ---------------------------------------------------------------
    // EVENT REPORTS
    // ---------------------------------------------------------------
    @Test
    fun `createReport should create report for EVENT`() {
        val dto = ReportRequestDTO(
            reporterId = 2L,
            reportedObjectId = 20L,
            reportedObject = "EVENT",
            reason = "Fake information"
        )

        val author = mockk<User>()
        every { author.id } returns 123L

        // Create the event mock, then stub its author property
        val event = mockk<Event>(relaxed = true)
        every { event.author } returns author

        every { eventRepository.findById(20L) } returns Optional.of(event)

        val savedReport = mockk<Report>()
        every { reportRepository.save(any()) } returns savedReport

        val result = reportService.createReport(dto)

        verify {
            reportRepository.save(
                match {
                    it.reportedUserId == 123L &&
                            it.reportedObjectId == 20L &&
                            it.reportedObject == "EVENT" &&
                            it.reason == "Fake information" &&
                            it.reporterId == 2L
                }
            )
        }

        assertEquals(savedReport, result)
    }

    @Test
    fun `createReport should throw when EVENT not found`() {
        every { eventRepository.findById(20L) } returns Optional.empty()

        val dto = ReportRequestDTO(
            reporterId = 2L,
            reportedObjectId = 20L,
            reportedObject = "EVENT",
            reason = "Fake info"
        )

        assertThrows(EntityNotFoundException::class.java) {
            reportService.createReport(dto)
        }
    }


    // ---------------------------------------------------------------
    // INVALID TYPE
    // ---------------------------------------------------------------
    @Test
    fun `createReport should throw IllegalArgumentException for invalid reportedObject`() {
        val dto = ReportRequestDTO(
            reporterId = 1L,
            reportedObjectId = 30L,
            reportedObject = "INVALID_TYPE",
            reason = "Unknown"
        )

        assertThrows(IllegalArgumentException::class.java) {
            reportService.createReport(dto)
        }
    }
}
