package service.mapper

import org.zpi.watchout.service.mapper.UserMapper

import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.zpi.watchout.data.entity.User

class UserMapperTest {

    private lateinit var userMapper: UserMapper;
    @BeforeEach
    fun setup(){
        userMapper = UserMapper()
    }


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
        user.id = 1L

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
        user.id = userId
        val dto = userMapper.mapAuthorUserToDto(user)


        assertEquals(userId, dto.id)
        assertEquals(userReputation, dto.reputation)
    }

}