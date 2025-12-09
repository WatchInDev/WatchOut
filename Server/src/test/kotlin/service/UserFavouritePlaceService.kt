package service
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.app.infrastructure.exceptions.IncorrectLocationException
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.entity.UserFavouritePlacePreference
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserFavouritePlacePreferenceRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.service.UserFavouritePlaceService
import org.zpi.watchout.service.dto.EditFavouritePlacePreferenceDTO
import org.zpi.watchout.service.dto.EditServicesPreferenceDTO
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.GeocodeResponseDTO
import org.zpi.watchout.service.web.GoogleGeocodeClient

class UserFavouritePlaceServiceTest {

    private lateinit var userFavouritePlaceRepository: UserFavouritePlaceRepository
    private lateinit var googleGeocodeClient: GoogleGeocodeClient
    private lateinit var userFavouritePlacePreferenceRepository: UserFavouritePlacePreferenceRepository
    private lateinit var eventTypeRepository: EventTypeRepository

    private lateinit var service: UserFavouritePlaceService

    @BeforeEach
    fun setUp() {
        userFavouritePlaceRepository = mockk()
        googleGeocodeClient = mockk()
        userFavouritePlacePreferenceRepository = mockk()
        eventTypeRepository = mockk()

        service = UserFavouritePlaceService(
            userFavouritePlaceRepository,
            googleGeocodeClient,
            userFavouritePlacePreferenceRepository,
            eventTypeRepository
        )
    }

    // ---------------------------------------------------------
    // addFavouritePlace
    // ---------------------------------------------------------

    @Test
    fun `addFavouritePlace should save favourite place and preferences`() {
        val userId = 1L

        val request = mockk<FavouritePlaceRequestDTO>()
        every { request.placeName } returns "Home"
        every { request.latitude } returns 51.0
        every { request.longitude } returns 19.0

        val services = mockk<EditServicesPreferenceDTO>()
        every { services.weather } returns true
        every { services.electricity } returns false
        every { services.eventTypes } returns listOf(10L)


        // Repository mocks
        val savedPlace = mockk<UserFavouritePlace>()
        every { savedPlace.id } returns 100L

        every { userFavouritePlaceRepository.save(any()) } returns savedPlace

        val eventType = mockk<EventType>()
        every { eventTypeRepository.findById(10L) } returns java.util.Optional.of(eventType)

        val savedPref = mockk<UserFavouritePlacePreference>()
        every { userFavouritePlacePreferenceRepository.save(any()) } returns savedPref

        val result = service.addFavouritePlace(userId, request)

        assertNotNull(result)
        verify { userFavouritePlaceRepository.save(any()) }
        verify { userFavouritePlacePreferenceRepository.save(any()) }
    }

    @Test
    fun `addFavouritePlace should throw IncorrectLocationException when address invalid`() {
        val request = mockk<FavouritePlaceRequestDTO>()
        every { request.latitude } returns 51.0
        every { request.longitude } returns 19.0

        val geoResponse = mockk<GeocodeResponseDTO>()
        every { geoResponse.results } returns emptyList()

        every {
            googleGeocodeClient.getAddressFromCoordinates(any(), any())
        } returns geoResponse

        assertThrows(IncorrectLocationException::class.java) {
            service.addFavouritePlace(1L, request)
        }
    }

    @Test
    fun `addFavouritePlace should throw EntityNotFoundException when event type missing`() {
        val request = mockk<FavouritePlaceRequestDTO>()
        every { request.placeName } returns "Home"
        every { request.latitude } returns 51.0
        every { request.longitude } returns 19.0

        val services = mockk<EditServicesPreferenceDTO>()
        every { services.weather } returns true
        every { services.electricity } returns false
        every { services.eventTypes } returns listOf(99L)



        // Mock geocode with valid components


        val savedPlace = mockk<UserFavouritePlace>()
        every { savedPlace.id } returns 100L
        every { userFavouritePlaceRepository.save(any()) } returns savedPlace

        every { eventTypeRepository.findById(99L) } returns java.util.Optional.empty()

        assertThrows(EntityNotFoundException::class.java) {
            service.addFavouritePlace(1L, request)
        }
    }

    // ---------------------------------------------------------
    // editFavouritePlacePreference
    // ---------------------------------------------------------

    @Test
    fun `editFavouritePlacePreference should update preference`() {
        val userId = 1L
        val placeId = 20L

        val savedPlace = mockk<UserFavouritePlace>()
        every { savedPlace.id } returns placeId
        every { userFavouritePlaceRepository.findByUserId(userId) } returns listOf(savedPlace)

        val pref = mockk<UserFavouritePlacePreference>(relaxed = true)
        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(placeId) } returns pref

        val editDTO = mockk<EditFavouritePlacePreferenceDTO>()
        every { editDTO.radius } returns 200.0
        every { editDTO.notificationsEnable } returns true

        val services = mockk<EditServicesPreferenceDTO>()
        every { services.weather } returns false
        every { services.electricity } returns true
        every { services.eventTypes } returns listOf(5L)

        every { editDTO.services } returns services

        val eventType = mockk<EventType>()
        every { eventTypeRepository.findById(5L) } returns java.util.Optional.of(eventType)

        every { userFavouritePlacePreferenceRepository.save(any()) } returns pref

        service.editFavouritePlacePreference(userId, placeId, editDTO)

        verify { userFavouritePlacePreferenceRepository.save(pref) }
    }

    @Test
    fun `editFavouritePlacePreference should throw when place not found for user`() {
        every { userFavouritePlaceRepository.findByUserId(1L) } returns emptyList()

        assertThrows(IncorrectLocationException::class.java) {
            service.editFavouritePlacePreference(1L, 999L, mockk())
        }
    }

    @Test
    fun `editFavouritePlacePreference should throw when preference does not exist`() {
        val place = mockk<UserFavouritePlace>()
        every { place.id } returns 44L
        every { userFavouritePlaceRepository.findByUserId(1L) } returns listOf(place)

        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(44L) } returns null

        assertThrows(IncorrectLocationException::class.java) {
            service.editFavouritePlacePreference(1L, 44L, mockk())
        }
    }

    // ---------------------------------------------------------
    // getFavouritePlaces
    // ---------------------------------------------------------

    @Test
    fun `getFavouritePlaces should return list of DTOs`() {
        val place = mockk<UserFavouritePlace>()
        every { place.id } returns 10L
        every { userFavouritePlaceRepository.findByUserId(1L) } returns listOf(place)

        val pref = mockk<UserFavouritePlacePreference>()
        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(10L) } returns pref

        val result = service.getFavouritePlaces(1L)

        assertEquals(1, result.size)
    }

    // ---------------------------------------------------------
    // removeFavouritePlace
    // ---------------------------------------------------------

    @Test
    fun `removeFavouritePlace should delete place`() {
        val place = mockk<UserFavouritePlace>()
        every { place.id } returns 10L
        every { userFavouritePlaceRepository.findByUserId(1L) } returns listOf(place)

        every { userFavouritePlaceRepository.delete(place) } just Runs

        service.removeFavouritePlace(10L, 1L)

        verify { userFavouritePlaceRepository.delete(place) }
    }

    @Test
    fun `removeFavouritePlace should throw when place not found`() {
        every { userFavouritePlaceRepository.findByUserId(1L) } returns emptyList()

        assertThrows(IncorrectLocationException::class.java) {
            service.removeFavouritePlace(10L, 1L)
        }
    }
}