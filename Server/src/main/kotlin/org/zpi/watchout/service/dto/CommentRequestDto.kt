package org.zpi.watchout.service.dto

data class CommentRequestDto(
    val content: String,
    val userId: Long,
    val eventId: Long
)
