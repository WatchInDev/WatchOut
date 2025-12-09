package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.context.MessageSource
import org.springframework.context.i18n.LocaleContextHolder
import org.zpi.watchout.data.entity.TokenFCM
import org.zpi.watchout.data.repos.TokenFCMRepository
import org.zpi.watchout.service.NotificationService
import org.zpi.watchout.service.NotificationType
import org.zpi.watchout.service.web.FCMClient
import java.util.*

class NotificationServiceTest {

    private lateinit var messageSource: MessageSource
    private lateinit var fcmClient: FCMClient
    private lateinit var tokenRepository: TokenFCMRepository
    private lateinit var service: NotificationService

    @BeforeEach
    fun setup() {
        messageSource = mockk()
        fcmClient = mockk(relaxed = true)
        tokenRepository = mockk()

        service = NotificationService(messageSource, fcmClient, tokenRepository)
    }

    // -------------------------------------------------------
    // Helper
    // -------------------------------------------------------
    private fun mockMessageSource(titleKey: String, bodyKey: String, title: String, body: String) {
        every { messageSource.getMessage(titleKey, null, LocaleContextHolder.getLocale()) } returns title
        every { messageSource.getMessage(bodyKey, any(), LocaleContextHolder.getLocale()) } returns body
    }

    // -------------------------------------------------------
    // COMMENT NOTIFICATION
    // -------------------------------------------------------
    @Test
    fun `createNotification sends COMMENT notification`() {
        val userId = 42L
        val token = TokenFCM(userId = userId, token = "abc123")

        every { tokenRepository.findByUserId(userId) } returns token

        mockMessageSource(
            titleKey = "notification.comment.title",
            bodyKey = "notification.comment.body",
            title = "Comment Title",
            body = "Comment Body"
        )

        service.createNotification(NotificationType.COMMENT, userId, "arg1")

        verify {
            messageSource.getMessage("notification.comment.title", null, any())
            messageSource.getMessage("notification.comment.body", arrayOf("arg1"), any())

            fcmClient.sendMessage("Comment Body", "Comment Title", "abc123")
        }
    }

    // -------------------------------------------------------
    // EVENT NOTIFICATION
    // -------------------------------------------------------
    @Test
    fun `createNotification sends EVENT notification`() {
        val userId = 55L
        val token = TokenFCM(userId = userId, token = "xyz789")

        every { tokenRepository.findByUserId(userId) } returns token

        mockMessageSource(
            titleKey = "notification.event.title",
            bodyKey = "notification.event.body",
            title = "Event Title",
            body = "Event Body"
        )

        service.createNotification(NotificationType.EVENT, userId, "A", "B")

        verify {
            messageSource.getMessage("notification.event.title", null, any())
            messageSource.getMessage("notification.event.body", arrayOf("A", "B"), any())

            fcmClient.sendMessage("Event Body", "Event Title", "xyz789")
        }
    }

    // -------------------------------------------------------
    // EXTERNAL WARNING NOTIFICATION
    // -------------------------------------------------------
    @Test
    fun `createNotification sends EXTERNAL_WARNING notification`() {
        val userId = 100L
        val token = TokenFCM(userId = userId, token = "warn456")

        every { tokenRepository.findByUserId(userId) } returns token

        mockMessageSource(
            titleKey = "notification.external_warning.title",
            bodyKey = "notification.external_warning.body",
            title = "Warning Title",
            body = "Warning Body"
        )

        service.createNotification(NotificationType.EXTERNAL_WARNING, userId, "ALERT")

        verify {
            messageSource.getMessage("notification.external_warning.title", null, any())
            messageSource.getMessage("notification.external_warning.body", arrayOf("ALERT"), any())

            fcmClient.sendMessage("Warning Body", "Warning Title", "warn456")
        }
    }

    // -------------------------------------------------------
    // NO TOKEN → DO NOTHING
    // -------------------------------------------------------
    @Test
    fun `createNotification does not send anything when user has no token`() {
        val userId = 99L
        every { tokenRepository.findByUserId(userId) } returns null

        service.createNotification(NotificationType.COMMENT, userId)

        verify(exactly = 0) { fcmClient.sendMessage(any(), any(), any()) }
        verify(exactly = 0) { messageSource.getMessage(any(), any(), any()) }
    }
}
