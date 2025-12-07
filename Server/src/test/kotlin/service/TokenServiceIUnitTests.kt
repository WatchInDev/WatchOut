package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.zpi.watchout.data.entity.*
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.EventTypeService
import org.zpi.watchout.service.mapper.EventTypeMapper
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.ReportRepository
import org.zpi.watchout.data.repos.TokenFCMRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.AdminService
import org.zpi.watchout.service.TokenService
import org.zpi.watchout.service.dto.AdminEventDTO
import org.zpi.watchout.service.dto.AdminEventFlatRow
import org.zpi.watchout.service.dto.EventTypeDTO
import org.zpi.watchout.service.dto.AdminCommentsDTO
import org.zpi.watchout.service.dto.TokenFCMDTO

class TokenServiceTest {

    private lateinit var tokenFCMRepository: TokenFCMRepository
    private lateinit var tokenService: TokenService

    @BeforeEach
    fun setUp() {
        tokenFCMRepository = mockk()
        tokenService = TokenService(tokenFCMRepository)
    }

    @Test
    fun `upsertToken should call repository upsertToken`() {
        val userId = 1L
        val tokenDTO = TokenFCMDTO("test-token")

        every { tokenFCMRepository.upsertToken(userId, "test-token") } just Runs

        tokenService.upsertToken(userId, tokenDTO)

        verify { tokenFCMRepository.upsertToken(userId, "test-token") }
    }

    @Test
    fun `getTokenByUserId should return token when found`() {
        val userId = 1L
        val tokenEntity = mockk<TokenFCM> {
            every { token } returns "test-token"
        }

        every { tokenFCMRepository.findByUserId(userId) } returns tokenEntity

        val result = tokenService.getTokenByUserId(userId)

        assertEquals("test-token", result.tokenFCM)
    }

    @Test
    fun `getTokenByUserId should throw EntityNotFoundException when token not found`() {
        val userId = 1L
        every { tokenFCMRepository.findByUserId(userId) } returns null

        assertThrows<EntityNotFoundException> {
            tokenService.getTokenByUserId(userId)
        }
    }
}