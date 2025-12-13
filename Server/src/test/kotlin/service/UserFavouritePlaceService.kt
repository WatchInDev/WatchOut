package service
import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.locationtech.jts.geom.Point
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.app.infrastructure.exceptions.IncorrectLocationException
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.entity.UserFavouritePlacePreference
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserFavouritePlacePreferenceRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.service.UserFavouritePlaceService
import org.zpi.watchout.service.dto.AddressComponent
import org.zpi.watchout.service.dto.EditFavouritePlacePreferenceDTO
import org.zpi.watchout.service.dto.EditServicesPreferenceDTO
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.GeocodeResponseDTO
import org.zpi.watchout.service.web.GoogleGeocodeClient
import org.zpi.watchout.service.dto.Result


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

        assertThrows(MockKException::class.java) {
            service.addFavouritePlace(1L, request)
        }
    }

    // ---------------------------------------------------------
    // editFavouritePlacePreference
    // ---------------------------------------------------------

    @Test
    fun `editFavouritePlacePreference should throw when place not found for user`() {
        every { userFavouritePlaceRepository.findByUserId(1L) } returns emptyList()

        assertThrows(MockKException::class.java) {
            service.editFavouritePlacePreference(1L, 999L, mockk())
        }
    }

    @Test
    fun `editFavouritePlacePreference should throw when preference does not exist`() {
        val place = mockk<UserFavouritePlace>()
        every { place.id } returns 44L
        every { userFavouritePlaceRepository.findByUserId(1L) } returns listOf(place)

        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(44L) } returns null

        assertThrows(MockKException::class.java) {
            service.editFavouritePlacePreference(1L, 44L, mockk())
        }
    }

    // ---------------------------------------------------------
    // getFavouritePlaces
    // ---------------------------------------------------------

    @Test
    fun `getFavouritePlaces should return list of DTOs`() {
        val userId = 1L

        // Create a real UserFavouritePlace entity
        val geometryFactory = org.locationtech.jts.geom.GeometryFactory()
        val point = geometryFactory.createPoint(org.locationtech.jts.geom.Coordinate(19.0, 51.0)).also{
            it.srid = 4326
        }

        val place = org.zpi.watchout.data.entity.UserFavouritePlace(
            userId = userId,
            region = "RegionX",
            voivodeship = "VoivX",
            location = "LocationX",
            locality = "LocalityX",
            point = point,
            placeName = "Home"
        ).apply { id = 10L }

        every { userFavouritePlaceRepository.findByUserId(userId) } returns listOf(place)

        // Preference can be a relaxed mock or a real instance, depending on service usage
        val pref = io.mockk.mockk<org.zpi.watchout.data.entity.UserFavouritePlacePreference>(relaxed = true)
        every { userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(10L) } returns pref

        val result = service.getFavouritePlaces(userId)

        org.junit.jupiter.api.Assertions.assertEquals(1, result.size)
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