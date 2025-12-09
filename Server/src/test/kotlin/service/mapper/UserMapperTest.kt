package service.mapper

import org.zpi.watchout.service.mapper.UserMapper

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.zpi.watchout.data.entity.User

class UserMapperTest {

    private val userMapper = UserMapper()

    @Test
    fun `mapAuthorUserToDto should correctly map all fields`() {
        val userReputation = 500.0
        val user = User(
            name = "testuser",
            reputation = userReputation,
            email = "dwadw",
            externalId = "dwad",
            isBlocked = false
        )

        val dto = userMapper.mapAuthorUserToDto(user)


        assertEquals(userReputation, dto.reputation, "The reputation should match the User's reputation")
    }

    @Test
    fun `mapAuthorUserToDto should handle zero reputation`() {
        val userId = 2L
        val userReputation = 0.0
        val user = User(
            name = "testuser",
            reputation = userReputation,
            email = "dwadw",
            externalId = "dwad",
            isBlocked = false
        )

        // 2. Act
        val dto = userMapper.mapAuthorUserToDto(user)

        // 3. Assert
        assertEquals(userId, dto.id)
        assertEquals(userReputation, dto.reputation)
    }

}