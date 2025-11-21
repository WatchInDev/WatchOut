package org.zpi.watchout.service

import org.springframework.context.MessageSource
import org.springframework.context.i18n.LocaleContextHolder
import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.TokenFCMRepository
import org.zpi.watchout.service.web.FCMClient
import java.util.Locale

enum class NotificationType {
    COMMENT,
    EVENT,
    EXTERNAL_WARNING
}

@Service
class NotificationService(
    private val messageSource: MessageSource,
    private val fcmClient: FCMClient,
    private val fcmRepository: TokenFCMRepository
) {
    private fun getMessage(notificationType: NotificationType, vararg args: Any?): Pair<String, String> {
        val codeBody = when (notificationType) {
            NotificationType.COMMENT -> "notification.comment.body"
            NotificationType.EVENT -> "notification.event.body"
            NotificationType.EXTERNAL_WARNING -> "notification.external_warning.body"
        }
        val codeTitle = when (notificationType) {
            NotificationType.COMMENT -> "notification.comment.title"
            NotificationType.EVENT -> "notification.event.title"
            NotificationType.EXTERNAL_WARNING -> "notification.external_warning.title"
        }
        return messageSource.getMessage(codeTitle, null, LocaleContextHolder.getLocale()) to
               messageSource.getMessage(codeBody, args, LocaleContextHolder.getLocale())
    }


    fun createNotification(notificationType: NotificationType, userId: Long, vararg args: Any?) {
         val (title, body) = getMessage(notificationType, *args)
         val token = fcmRepository.findByUserId(userId)?: throw EntityNotFoundException("FCM token not found for user with id $userId")
         fcmClient.sendMessage(body, title, token.token)
    }


}