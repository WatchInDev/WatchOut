package org.zpi.watchout.service.web

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient

private val logger = KotlinLogging.logger {}

data class MessagePayload(
    val to: String,
    val title: String,
    val body: String
)


@Service
class FCMClient {
    val fcmWebClient = WebClient.builder()
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .baseUrl("https://exp.host/--/api/v2/push/send")
        .build()

    fun sendMessage(messageBody: String, messageTitle: String, fcmToken:String) {
        logger.info { "Sending message to FCM with body: $messageBody" }
        fcmWebClient.post()
            .bodyValue(createMessageBody(messageTitle, messageBody, fcmToken))
            .retrieve()
            .bodyToMono(String::class.java)
            .doOnError {
                logger.error(it) { "Error occurred while sending message to FCM: ${it.message}"}
            }
            .toFuture()
            .thenRun {
                logger.info { "send message to url https://exp.host/--/api/v2/push/send with title: $messageTitle, body: $messageBody, fcmToken: $fcmToken" }
            }

    }

    private fun createMessageBody(title: String, body:String , fcmToken: String): MessagePayload {
        return MessagePayload(
            to = fcmToken,
            title = title,
            body = body
        )
    }
}