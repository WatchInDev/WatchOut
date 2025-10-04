package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.dto.CommentResponseDTO
import org.zpi.watchout.service.mapper.CommentMapper

@Service
class CommentService (private val commentRepository: CommentRepository, private val commentMapper: CommentMapper, private val eventRepository: EventRepository) {
    fun getCommentsByEventId(eventId: Long): List<CommentResponseDTO> {
        return commentRepository.findByEventId(eventId)
    }

    fun addCommentToEvent(commentRequestDto: CommentRequestDTO, eventId: Long): CommentResponseDTO {
        if (!eventRepository.existsById(eventId)) {
            throw EntityNotFoundException("Event with id $eventId does not exist")
        }
        val comment = commentMapper.mapToEntity(commentRequestDto, authorId = 6, eventId) // TODO: replace with actual user id from auth
        return commentMapper.mapToDto(commentRepository.save(comment))
    }

}