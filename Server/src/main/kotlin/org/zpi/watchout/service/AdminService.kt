package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.enums.Role
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.ReportRepository
import org.zpi.watchout.service.dto.AdminCommentsDTO
import org.zpi.watchout.service.dto.AdminEventDTO
import org.zpi.watchout.service.dto.AdminUserDTO

@Service
class AdminService(val userRepository : UserRepository, val commentRepository: CommentRepository, val eventRepository: EventRepository, val reportRepository: ReportRepository) {


    fun blockUser(userId: Long) {
        val user = userRepository.findById(userId).orElseThrow { EntityNotFoundException("User not found") }
        if(user.isBlocked){
            throw IllegalArgumentException("User is already blocked")
        }
        user.isBlocked = true
        userRepository.save(user)
    }

    fun unblockUser(userId: Long) {
        val user = userRepository.findById(userId).orElseThrow { EntityNotFoundException("User not found") }
        if(!user.isBlocked){
            throw IllegalArgumentException("User is not blocked")
        }
        user.isBlocked = false
        userRepository.save(user)
    }

    fun getAllUsers() = userRepository.findAll().map { AdminUserDTO(it) }
    fun getAllBlockedUsers() = userRepository.findAll().filter { it.isBlocked }. map {AdminUserDTO(it) }


    fun deleteComment(commentId: Long) {
        val comment = commentRepository.findById(commentId).orElseThrow { EntityNotFoundException("Comment not found") }
        if(comment.isDeleted){
            throw IllegalArgumentException("Comment is already deleted")
        }
        comment.isDeleted = true
        commentRepository.save(comment)
    }

    fun deleteEvent(eventId: Long) {
        val event = eventRepository.findById(eventId).orElseThrow { EntityNotFoundException("Event not found") }
        if(!event.isActive){
            throw IllegalArgumentException("Event is already deactivated")
        }
        event.isActive = false
        eventRepository.save(event)
    }

    fun getAdminEvents(): List<AdminEventDTO> {
        val rows = eventRepository.findAllEventsWithCommentsFlat()
        return rows.groupBy { it.eventId }.map { (_, group) ->
            val first = group.first()
            val comments = group.filter { it.commentId != null }.map {
                AdminCommentsDTO(
                    id = it.commentId!!,
                    content = it.commentContent!!,
                    authorEmail = it.commentAuthorEmail!!,
                    authorId = it.commentAuthorId!!,
                    createdAt = it.commentCreatedAt!!.toLocalDateTime(),
                    isDeleted = it.isCommentDeleted!!
                )
            }
            AdminEventDTO(
                id = first.eventId,
                name = first.name,
                description = first.description,
                authorEmail = first.authorEmail,
                authorId = first.authorId,
                reportedDate = first.reportedDate.toLocalDateTime(),
                endDate = first.endDate.toLocalDateTime(),
                eventType = first.eventType,
                comments = comments,
                isActive = first.isActive
            )
        }
    }

    fun getAdminEventById(eventId: Long): AdminEventDTO {
        val rows = eventRepository.findEventById(eventId)
        return rows.groupBy { it.eventId }.map { (_, group) ->
            val first = group.first()
            val comments = group.filter { it.commentId != null }.map {
                AdminCommentsDTO(
                    id = it.commentId!!,
                    content = it.commentContent!!,
                    authorEmail = it.commentAuthorEmail!!,
                    authorId = it.commentAuthorId!!,
                    createdAt = it.commentCreatedAt!!.toLocalDateTime(),
                    isDeleted = it.isCommentDeleted!!
                )
            }
            AdminEventDTO(
                id = first.eventId,
                name = first.name,
                description = first.description,
                authorEmail = first.authorEmail,
                authorId = first.authorId,
                reportedDate = first.reportedDate.toLocalDateTime(),
                endDate = first.endDate.toLocalDateTime(),
                eventType = first.eventType,
                comments = comments,
                isActive = first.isActive
            )
        }.first()
    }

    fun getAdminEventsByAuthor(authorId: Long): List<AdminEventDTO> {
        val rows = eventRepository.findEventByUserId(authorId)
        return rows.groupBy { it.eventId }.map { (_, group) ->
            val first = group.first()
            val comments = group.filter { it.commentId != null }.map {
                AdminCommentsDTO(
                    id = it.commentId!!,
                    content = it.commentContent!!,
                    authorEmail = it.commentAuthorEmail!!,
                    authorId = it.commentAuthorId!!,
                    createdAt = it.commentCreatedAt!!.toLocalDateTime(),
                    isDeleted = it.isCommentDeleted!!
                )
            }
            AdminEventDTO(
                id = first.eventId,
                name = first.name,
                description = first.description,
                authorEmail = first.authorEmail,
                authorId = first.authorId,
                reportedDate = first.reportedDate.toLocalDateTime(),
                endDate = first.endDate.toLocalDateTime(),
                eventType = first.eventType,
                comments = comments,
                isActive = first.isActive
            )
        }
    }

    fun getAdminCommentsByAuthor(authorId: Long): List<AdminCommentsDTO> {
        val comments = commentRepository.getAdminCommentsByAuthor(authorId)
        return comments
    }

    fun getAdminCommentsById(commentId: Long): AdminCommentsDTO {
        val comment = commentRepository.getAdminCommentById(commentId)?: throw EntityNotFoundException("Comment with id $commentId not found")
        return comment
    }

    fun getReportedEvents() = reportRepository.findAll()





}