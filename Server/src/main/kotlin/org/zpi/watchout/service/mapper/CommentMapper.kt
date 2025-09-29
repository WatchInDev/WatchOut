package org.zpi.watchout.service.mapper

import org.springframework.stereotype.Component
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.dto.CommentRequestDto
import org.zpi.watchout.service.dto.CommentResponseDto

@Component
class CommentMapper(private val userRepository: UserRepository) {
    fun mapToDto(comment: Comment): CommentResponseDto {
        return CommentResponseDto(
            id = comment.id!!,
            content = comment.content,
            authorId = comment.author.id!!,
            eventId = comment.eventId,
            authorName = comment.author.name,
            authorLastname = comment.author.lastName,
            authorReputation = comment.author.reputation,
        )
    }

    fun mapToEntity(request: CommentRequestDto): Comment {
        return Comment(
            content = request.content,
            author = userRepository.findById(request.userId).orElseThrow({ EntityNotFoundException("User with id ${request.userId} not found") }),
            eventId = request.eventId
        )
    }
}