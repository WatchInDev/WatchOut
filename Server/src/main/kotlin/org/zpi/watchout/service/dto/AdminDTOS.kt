package org.zpi.watchout.service.dto

import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.User
import java.sql.Timestamp
import java.time.LocalDateTime

data class AdminEventFlatRow (
    val eventId: Long,
    val name: String,
    val description: String,
    val authorEmail: String,
    val authorId: Long,
    val reportedDate: Timestamp,
    val endDate: Timestamp,
    val eventType: String,
    val commentId: Long?,
    val commentContent: String?,
    val commentAuthorEmail: String?,
    val commentAuthorId: Long?,
    val commentCreatedAt: Timestamp?,
    val isActive: Boolean,
    val isCommentDeleted: Boolean?
)

data class AdminEventDTO(
    val id: Long,
    val name: String,
    val description: String,
    val authorEmail: String,
    val authorId: Long,
    val reportedDate: LocalDateTime,
    val endDate: LocalDateTime,
    val eventType: String,
    val comments: List<AdminCommentsDTO>,
    val isActive: Boolean
)

data class AdminUserDTO(
    val id: Long,
    val name: String,
    val email: String,
    val externalId: String,
    val isBlocked: Boolean,
){
    constructor(user: User) : this(
        id = user.id!!,
        name = user.name,
        email = user.email,
        externalId = user.externalId,
        isBlocked = user.isBlocked
    )
}

data class AdminCommentsDTO(
    val id: Long,
    val content: String,
    val authorEmail: String,
    val authorId: Long,
    val createdAt: LocalDateTime,
    val isDeleted: Boolean
)