package org.zpi.watchout.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.dto.CommentResponseDTO
import org.zpi.watchout.service.mapper.CommentMapper

@Service
class CommentService (private val commentRepository: CommentRepository, private val commentMapper: CommentMapper, private val eventRepository: EventRepository, private val geoService: GeoService) {
    fun getCommentsByEventId(eventId: Long, userId: Long, pageable: Pageable): Page<CommentResponseDTO> {
        return commentRepository.findByEventId(eventId, userId, pageable)
    }

    fun addCommentToEvent(commentRequestDto: CommentRequestDTO, eventId: Long, userId: Long): CommentResponseDTO {
        if (!eventRepository.existsById(eventId)) {
            throw EntityNotFoundException("Event with id $eventId does not exist")
        }

        if (!geoService.isUserWithinDistance(eventId, commentRequestDto.latitude, commentRequestDto.longitude)) {
            throw IllegalArgumentException("User is not within the allowed distance to comment on this event")
        }
        val comment = commentMapper.mapToEntity(commentRequestDto, authorId = userId, eventId)
        return commentMapper.mapToDto(commentRepository.save(comment))
    }
}