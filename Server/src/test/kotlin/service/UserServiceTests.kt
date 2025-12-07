package service
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.transaction.annotation.Transactional
import java.util.*
import org.zpi.watchout.data.entity.*
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.EventTypeService
import org.zpi.watchout.service.mapper.EventTypeMapper
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.UserService
import org.zpi.watchout.service.dto.EventTypeDTO
import org.zpi.watchout.service.dto.GlobalPreferencesDTO

class UserServiceTest {

    private lateinit var userRepository: UserRepository
    private lateinit var userGlobalPreferenceRepository: UserGlobalPreferenceRepository
    private lateinit var userService: UserService

    @BeforeEach
    fun setUp() {
        userRepository = mockk()
        userGlobalPreferenceRepository = mockk()
        userService = UserService(userRepository, userGlobalPreferenceRepository)
    }


    @Test
    fun `createUser should not create user when user already exists`() {
        val externalId = "ext123"
        val name = "John Doe"
        val email = "john.doe@example.com"
        val existingUser = User(name, email, 0.25, externalId)

        every { userRepository.findByExternalId(externalId) } returns Optional.of(existingUser)

        userService.createUser(externalId, name, email)

        verify { userRepository.findByExternalId(externalId) }
        verify(exactly = 0) { userRepository.save(any<User>()) }
        verify(exactly = 0) { userGlobalPreferenceRepository.save(any<UserGlobalPreference>()) }
    }

    @Test
    fun `editPreferences should update preferences when user preferences exist`() {
        val userId = 1L
        val globalPreferencesDTO = GlobalPreferencesDTO(
            notifyOnComment = false,
            notifyOnEvent = true,
            notifyOnExternalWarning = false
        )
        val existingPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = true,
            notifyOnEvent = true,
            notifyOnExternalWarning = true
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns existingPreference
        every { userGlobalPreferenceRepository.save(any<UserGlobalPreference>()) } returns existingPreference

        userService.editPreferences(userId, globalPreferencesDTO)

        verify { userGlobalPreferenceRepository.findByUserId(userId) }
        assertEquals(false, existingPreference.notifyOnComment)
        assertEquals(true, existingPreference.notifyOnEvent)
        assertEquals(false, existingPreference.notifyOnExternalWarning)
        verify { userGlobalPreferenceRepository.save(existingPreference) }
    }

    @Test
    fun `editPreferences should not save when user preferences do not exist`() {
        val userId = 1L
        val globalPreferencesDTO = GlobalPreferencesDTO(
            notifyOnComment = false,
            notifyOnEvent = true,
            notifyOnExternalWarning = false
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns null

        userService.editPreferences(userId, globalPreferencesDTO)

        verify { userGlobalPreferenceRepository.findByUserId(userId) }
        verify(exactly = 0) { userGlobalPreferenceRepository.save(any<UserGlobalPreference>()) }
    }

    @Test
    fun `editPreferences should handle all preferences set to false`() {
        val userId = 1L
        val globalPreferencesDTO = GlobalPreferencesDTO(
            notifyOnComment = false,
            notifyOnEvent = false,
            notifyOnExternalWarning = false
        )
        val existingPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = true,
            notifyOnEvent = true,
            notifyOnExternalWarning = true
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns existingPreference
        every { userGlobalPreferenceRepository.save(any<UserGlobalPreference>()) } returns existingPreference

        userService.editPreferences(userId, globalPreferencesDTO)

        assertEquals(false, existingPreference.notifyOnComment)
        assertEquals(false, existingPreference.notifyOnEvent)
        assertEquals(false, existingPreference.notifyOnExternalWarning)
        verify { userGlobalPreferenceRepository.save(existingPreference) }
    }

    @Test
    fun `editPreferences should handle all preferences set to true`() {
        val userId = 1L
        val globalPreferencesDTO = GlobalPreferencesDTO(
            notifyOnComment = true,
            notifyOnEvent = true,
            notifyOnExternalWarning = true
        )
        val existingPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = false,
            notifyOnEvent = false,
            notifyOnExternalWarning = false
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns existingPreference
        every { userGlobalPreferenceRepository.save(any<UserGlobalPreference>()) } returns existingPreference

        userService.editPreferences(userId, globalPreferencesDTO)

        assertEquals(true, existingPreference.notifyOnComment)
        assertEquals(true, existingPreference.notifyOnEvent)
        assertEquals(true, existingPreference.notifyOnExternalWarning)
        verify { userGlobalPreferenceRepository.save(existingPreference) }
    }

    @Test
    fun `editPreferences should handle negative userId`() {
        val userId = -1L
        val globalPreferencesDTO = GlobalPreferencesDTO(
            notifyOnComment = true,
            notifyOnEvent = true,
            notifyOnExternalWarning = true
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns null


        userService.editPreferences(userId, globalPreferencesDTO)


        verify { userGlobalPreferenceRepository.findByUserId(userId) }
        verify(exactly = 0) { userGlobalPreferenceRepository.save(any<UserGlobalPreference>()) }
    }

    @Test
    fun `getUserGlobalPreferences should return preferences when they exist`() {
        val userId = 1L
        val userGlobalPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = true,
            notifyOnEvent = false,
            notifyOnExternalWarning = true
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns userGlobalPreference

        val result = userService.getUserGlobalPreferences(userId)

        assertEquals(true, result.notifyOnComment)
        assertEquals(false, result.notifyOnEvent)
        assertEquals(true, result.notifyOnExternalWarning)
        verify { userGlobalPreferenceRepository.findByUserId(userId) }
    }

    @Test
    fun `getUserGlobalPreferences should throw EntityNotFoundException when preferences do not exist`() {

        val userId = 1L
        every { userGlobalPreferenceRepository.findByUserId(userId) } returns null

        val exception = assertThrows<EntityNotFoundException> {
            userService.getUserGlobalPreferences(userId)
        }

        assertEquals("User global preferences not found for user with id $userId", exception.message)
        verify { userGlobalPreferenceRepository.findByUserId(userId) }
    }

    @Test
    fun `getUserGlobalPreferences should handle all preferences false`() {

        val userId = 1L
        val userGlobalPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = false,
            notifyOnEvent = false,
            notifyOnExternalWarning = false
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns userGlobalPreference

        val result = userService.getUserGlobalPreferences(userId)

        assertEquals(false, result.notifyOnComment)
        assertEquals(false, result.notifyOnEvent)
        assertEquals(false, result.notifyOnExternalWarning)
    }

    @Test
    fun `getUserGlobalPreferences should handle all preferences true`() {
        val userId = 1L
        val userGlobalPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = true,
            notifyOnEvent = true,
            notifyOnExternalWarning = true
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns userGlobalPreference

        val result = userService.getUserGlobalPreferences(userId)

        assertEquals(true, result.notifyOnComment)
        assertEquals(true, result.notifyOnEvent)
        assertEquals(true, result.notifyOnExternalWarning)
    }

    @Test
    fun `getUserGlobalPreferences should handle negative userId`() {
        val userId = -1L
        every { userGlobalPreferenceRepository.findByUserId(userId) } returns null

        val exception = assertThrows<EntityNotFoundException> {
            userService.getUserGlobalPreferences(userId)
        }

        assertEquals("User global preferences not found for user with id $userId", exception.message)
    }

    @Test
    fun `getUserGlobalPreferences should handle zero userId`() {
        val userId = 0L
        every { userGlobalPreferenceRepository.findByUserId(userId) } returns null

        val exception = assertThrows<EntityNotFoundException> {
            userService.getUserGlobalPreferences(userId)
        }

        assertEquals("User global preferences not found for user with id $userId", exception.message)
    }

    @Test
    fun `getUserGlobalPreferences should handle large userId`() {
        val userId = Long.MAX_VALUE
        val userGlobalPreference = UserGlobalPreference(
            userId = userId,
            notifyOnComment = true,
            notifyOnEvent = false,
            notifyOnExternalWarning = true
        )

        every { userGlobalPreferenceRepository.findByUserId(userId) } returns userGlobalPreference

        val result = userService.getUserGlobalPreferences(userId)

        assertEquals(true, result.notifyOnComment)
        assertEquals(false, result.notifyOnEvent)
        assertEquals(true, result.notifyOnExternalWarning)
    }
}