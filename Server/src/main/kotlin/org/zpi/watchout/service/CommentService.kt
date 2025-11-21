package org.zpi.watchout.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.dto.CommentResponseDTO
import org.zpi.watchout.service.mapper.CommentMapper

@Service
class CommentService (private val commentRepository: CommentRepository, private val commentMapper: CommentMapper, private val eventRepository: EventRepository, private val userGlobalPreferenceRepository: UserGlobalPreferenceRepository, private val notificationService: NotificationService) {
    fun getCommentsByEventId(eventId: Long, userId: Long, pageable: Pageable): Page<CommentResponseDTO> {
        return commentRepository.findByEventId(eventId, userId, pageable)
    }

    fun addCommentToEvent(commentRequestDto: CommentRequestDTO, eventId: Long, userId: Long): CommentResponseDTO {
        val event = eventRepository.findById(eventId).orElseThrow { EntityNotFoundException("Event with id $eventId does not exist") }

        if (userGlobalPreferenceRepository.findByUserId(event.author.id!!)?.notifyOnComment == true) {
            notificationService.createNotification(
                NotificationType.COMMENT,
                eventRepository.findById(eventId).get().author.id!!,
                event.name
            )
        }

        val comment = commentMapper.mapToEntity(commentRequestDto, authorId = userId, eventId)
        return commentMapper.mapToDto(commentRepository.save(comment))
    }

}