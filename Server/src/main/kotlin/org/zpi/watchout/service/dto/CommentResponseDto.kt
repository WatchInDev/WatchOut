package org.zpi.watchout.service.dto

data class CommentResponseDto(
    val id: Long,
    val content: String,
    val authorId: Long,
    val eventId: Long,
    val authorName: String,
    val authorLastname: String,
    val authorReputation: Double,
) {
}