package org.zpi.watchout.service.dto

data class CommentResponseDTO(
    val id: Long,
    val content: String,
    val eventId: Long,
    val author: AuthorResponseDTO,
    val rating: Double
) {
}