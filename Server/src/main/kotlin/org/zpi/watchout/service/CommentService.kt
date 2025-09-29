package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.service.dto.CommentRequestDto
import org.zpi.watchout.service.dto.CommentResponseDto
import org.zpi.watchout.service.mapper.CommentMapper

@Service
class CommentService (private val commentRepository: CommentRepository, private val commentMapper: CommentMapper, private val eventRepository: EventRepository) {
    fun getCommentsByEventId(eventId: Long): List<CommentResponseDto> {
        return commentRepository.findByEventId(eventId).map { commentMapper.mapToDto(it) }
    }

    fun addCommentToEvent(commentRequestDto: CommentRequestDto): CommentResponseDto {
        if (!eventRepository.existsById(commentRequestDto.eventId)) {
            throw EntityNotFoundException("Event with id ${commentRequestDto.eventId} does not exist")
        }
        val comment = commentMapper.mapToEntity(commentRequestDto)
        return commentMapper.mapToDto(commentRepository.save(comment))
    }

}