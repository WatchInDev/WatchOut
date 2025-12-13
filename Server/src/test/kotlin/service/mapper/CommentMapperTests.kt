package service.mapper

import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.dto.AuthorResponseDTO
import org.zpi.watchout.service.dto.CommentRequestDTO
import org.zpi.watchout.service.mapper.CommentMapper
import org.zpi.watchout.service.mapper.UserMapper
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class CommentMapperTest {

    private val userRepository: UserRepository = mockk()
    private val userMapper: UserMapper = mockk()

    private val commentMapper = CommentMapper(userRepository, userMapper)

    @Test
    fun `mapToDto correctly maps all fields`() {
        val author = mockk<User>()
        every { author.id } returns 42L

        val createdAt = LocalDateTime.of(2025, 11, 30, 12, 0)

        val comment = Comment(
            content = "Great event!",
            author = author,
            eventId = 10L
        ).apply {
            id = 5L
            this.createdAt = createdAt
        }

        val authorDto = mockk<AuthorResponseDTO>()
        every { userMapper.mapAuthorUserToDto(author) } returns authorDto

        val result = commentMapper.mapToDto(comment)

        assertEquals(5L, result.id)
        assertEquals("Great event!", result.content)
        assertEquals(10L, result.eventId)
        assertEquals(createdAt, result.createdAt)
        assertEquals(0.0, result.rating)
        assertEquals(0.0, result.ratingForCurrentUser)
        assertEquals(true, result.isAuthor)
        assertEquals(authorDto, result.author)
    }

    @Test
    fun `mapToEntity correctly creates Comment when user exists`() {
        val authorId = 3L
        val eventId = 20L
        val user = mockk<User>()
        val request = CommentRequestDTO(content = "Nice post", latitude = 50.0, longitude = 50.0)

        every { userRepository.findById(authorId) } returns Optional.of(user)

        val result = commentMapper.mapToEntity(request, authorId, eventId)

        assertEquals("Nice post", result.content)
        assertEquals(user, result.author)
        assertEquals(eventId, result.eventId)
    }

    @Test
    fun `mapToEntity throws EntityNotFoundException when user does not exist`() {
        val authorId = 999L
        val eventId = 20L
        val request = CommentRequestDTO(content = "Test", latitude = 50.0, longitude = 50.0)

        every { userRepository.findById(authorId) } returns Optional.empty()

        val exception = assertThrows(EntityNotFoundException::class.java) {
            commentMapper.mapToEntity(request, authorId, eventId)
        }

        assertEquals("User with id 999 not found", exception.message)
    }
}

