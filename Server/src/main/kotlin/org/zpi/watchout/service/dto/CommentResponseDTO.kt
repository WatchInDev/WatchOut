package org.zpi.watchout.service.dto

import java.time.LocalDateTime

data class CommentResponseDTO(
    val id: Long,
    val content: String,
    val eventId: Long,
    val createdAt: LocalDateTime,
    val author: AuthorResponseDTO,
    val rating: Double,
    val ratingForCurrentUser: Double,
    val isAuthor : Boolean
) {
}