package org.zpi.watchout.service.mapper

import org.springframework.stereotype.Component
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.dto.CommentResponseDTO

@Component
class CommentMapper(private val userRepository: UserRepository, private val userMapper: UserMapper) {
    fun mapToDto(comment: Comment): CommentResponseDTO {
        return CommentResponseDTO(
            id = comment.id!!,
            content = comment.content,
            eventId = comment.eventId,
            createdAt = comment.createdAt!!,
            author = userMapper.mapAuthorUserToDto(comment.author),
            rating = 0.0,
            ratingForCurrentUser = 0.0,
            isAuthor = true
        )
    }

    fun mapToEntity(request: CommentRequestDTO, authorId:Long, eventId: Long): Comment {
        return Comment(
            content = request.content,
            author = userRepository.findById(authorId).orElseThrow({ EntityNotFoundException("User with id ${authorId} not found") }),
            eventId = eventId
        )
    }
}