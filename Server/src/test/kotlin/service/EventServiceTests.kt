package service

import io.mockk.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.service.EventService
import org.zpi.watchout.service.GeoService
import org.zpi.watchout.service.NotificationService
import org.zpi.watchout.service.ReputationService
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import org.zpi.watchout.service.mapper.EventMapper
import java.time.LocalDateTime
import org.zpi.watchout.data.entity.*
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.EventTypeService
import org.zpi.watchout.service.NotificationType
import org.zpi.watchout.service.azure.blob.AzureBlobService
import org.zpi.watchout.service.dto.AuthorResponseDTO
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventTypeDTO
import org.zpi.watchout.service.dto.ReasonCannotPost

class EventServiceTest {

    private lateinit var eventRepository: EventRepository
    private lateinit var eventMapper: EventMapper
    private lateinit var userFavouritePlaceRepository: UserFavouritePlaceRepository
    private lateinit var notificationService: NotificationService
    private lateinit var userGlobalPreferenceRepository: UserGlobalPreferenceRepository
    private lateinit var reputationService: ReputationService
    private lateinit var geoService: GeoService
    private lateinit var eventService: EventService
    private lateinit var azureBlobService: AzureBlobService
    private lateinit var eventTypeRepository: EventTypeRepository

    @BeforeEach
    fun setUp() {
        eventRepository = mockk()
        eventMapper = mockk()
        userFavouritePlaceRepository = mockk()
        notificationService = mockk()
        userGlobalPreferenceRepository = mockk()
        reputationService = mockk()
        geoService = mockk()
        azureBlobService = mockk()
        eventTypeRepository = mockk()

        eventService = EventService(
            eventRepository,
            eventMapper,
            userFavouritePlaceRepository,
            notificationService,
            userGlobalPreferenceRepository,
            reputationService,
            geoService,
            eventTypeRepository = eventTypeRepository,
            azureBlobService = azureBlobService
        )
    }

    @Test
    fun `getAllEvents should return list of events from repository`() {
        val userId = 1L
        val eventGetRequestDTO = EventGetRequestDTO(
            swLat = 40.0,
            swLng = -74.0,
            neLat = 41.0,
            neLng = -73.0,
            eventTypeIds = listOf(1L, 2L),
            reportedDateFrom = LocalDateTime.now().minusDays(1),
            reportedDateTo = LocalDateTime.now(),
            distance = 10.0,
            rating = 4.5
        )
        val expectedEvents = listOf<EventResponseDTO>(
            createMockEventResponseDTO(1L, "Event 1"),
            createMockEventResponseDTO(2L, "Event 2")
        )

        every { eventRepository.findByLocation(eventGetRequestDTO, userId) } returns expectedEvents

        val result = eventService.getAllEvents(eventGetRequestDTO, userId)

        assertEquals(expectedEvents, result)
        verify { eventRepository.findByLocation(eventGetRequestDTO, userId) }
    }

    @Test
    fun `createEvent should create event successfully when user has reputation and is within distance`() {
        val userId = 1L
        val eventRequestDto = createValidEventRequestDTO()
        val mockEvent = mockk<Event>()
        val expectedResponse = createMockEventResponseDTO(1L, "Test Event")

        every { reputationService.isAbleToPostEvents(userId) } returns true
        every { geoService.isUserWithinDistanceByEventCoords(any(), any(), any(), any()) } returns true
        every { eventMapper.mapToEntity(eventRequestDto, userId) } returns mockEvent
        every { userFavouritePlaceRepository.findPlaceByCoordinates(any(), any()) } returns emptyList()
        every { eventRepository.save(mockEvent) } returns mockEvent
        every { eventMapper.mapToDto(mockEvent) } returns expectedResponse

        val result = eventService.createEvent(eventRequestDto, userId)

        assertEquals(expectedResponse, result)
        verify { reputationService.isAbleToPostEvents(userId) }
        verify { geoService.isUserWithinDistanceByEventCoords(
            eventRequestDto.latitude,
            eventRequestDto.longitude,
            eventRequestDto.userLatitude,
            eventRequestDto.userLongitude
        ) }
        verify { eventMapper.mapToEntity(eventRequestDto, userId) }
        verify { eventRepository.save(mockEvent) }
        verify { eventMapper.mapToDto(mockEvent) }
    }

    @Test
    fun `createEvent should throw AccessDeniedException when user has low reputation`() {
        val userId = 1L
        val eventRequestDto = createValidEventRequestDTO()

        every { reputationService.isAbleToPostEvents(userId) } returns false

        val exception = assertThrows<AccessDeniedException> {
            eventService.createEvent(eventRequestDto, userId)
        }

        assertEquals("User with id $userId is not allowed to report more events today due to low reputation", exception.message)
        verify { reputationService.isAbleToPostEvents(userId) }
        verify(exactly = 0) { geoService.isUserWithinDistanceByEventCoords(any(), any(), any(), any()) }
    }

    @Test
    fun `createEvent should throw IllegalArgumentException when user is not within allowed distance`() {
        val userId = 1L
        val eventRequestDto = createValidEventRequestDTO()

        every { reputationService.isAbleToPostEvents(userId) } returns true
        every { geoService.isUserWithinDistanceByEventCoords(any(), any(), any(), any()) } returns false

        val exception = assertThrows<IllegalArgumentException> {
            eventService.createEvent(eventRequestDto, userId)
        }

        assertEquals("User is not within the allowed distance to report this event", exception.message)
        verify { reputationService.isAbleToPostEvents(userId) }
        verify { geoService.isUserWithinDistanceByEventCoords(
            eventRequestDto.latitude,
            eventRequestDto.longitude,
            eventRequestDto.userLatitude,
            eventRequestDto.userLongitude
        ) }
    }


    @Test
    fun `createEvent should not send notifications when no favourite places found`() {
        val userId = 1L
        val eventRequestDto = createValidEventRequestDTO()
        val mockEvent = mockk<Event>()
        val expectedResponse = createMockEventResponseDTO(1L, "Test Event")

        every { reputationService.isAbleToPostEvents(userId) } returns true
        every { geoService.isUserWithinDistanceByEventCoords(any(), any(), any(), any()) } returns true
        every { eventMapper.mapToEntity(eventRequestDto, userId) } returns mockEvent
        every { userFavouritePlaceRepository.findPlaceByCoordinates(any(), any()) } returns emptyList()
        every { eventRepository.save(mockEvent) } returns mockEvent
        every { eventMapper.mapToDto(mockEvent) } returns expectedResponse

        val result = eventService.createEvent(eventRequestDto, userId)

        assertEquals(expectedResponse, result)
        verify(exactly = 0) { notificationService.createNotification(any(), any(), any(), any()) }
    }

    @Test
    fun `getClusters should return clusters from repository`() {
        val clusterRequestDto = ClusterRequestDTO(
            eps = 0.5,
            minPoints = 3,
            swLat = 40.0,
            swLng = -74.0,
            neLat = 41.0,
            neLng = -73.0,
            eventTypeIds = listOf(1L),
            reportedDateFrom = LocalDateTime.now().minusDays(1),
            reportedDateTo = LocalDateTime.now(),
            distance = 10.0,
            rating = 4.0
        )
        val expectedClusters = listOf(
            createMockClusterResponseDTO(-73.5, 40.5, 10),
            createMockClusterResponseDTO(-73.7, 40.7, 5)
        )

        every { eventRepository.calculateClusters(clusterRequestDto, 0.5, 3) } returns expectedClusters

        val result = eventService.getClusters(clusterRequestDto)

        assertEquals(expectedClusters, result)
        verify { eventRepository.calculateClusters(clusterRequestDto, 0.5, 3) }
    }

    @Test
    fun `isAbleToPostEvents should return true when user can post events`() {
        val userId = 1L
        every { reputationService.isAbleToPostEvents(userId) } returns true

        val result = eventService.isAbleToPostEvents(userId,30.0,30.0,30.0,30.0)

        assertTrue(result.canPost)
        assertNull(result.reason)
        verify { reputationService.isAbleToPostEvents(userId) }
    }

    @Test
    fun `isAbleToPostEvents should return false with reputation restriction when user cannot post events`() {
        val userId = 1L
        every { reputationService.isAbleToPostEvents(userId) } returns false

        val result = eventService.isAbleToPostEvents(userId,30.0,30.0,30.0,30.0)


        assertFalse(result.canPost)
        assertEquals(ReasonCannotPost.REPUTATION_RESTRICTION.name, result.reason)
        verify { reputationService.isAbleToPostEvents(userId) }
    }


    private fun createValidEventRequestDTO(): EventRequestDTO {
        return EventRequestDTO(
            name = "Test Event",
            description = "Test Description",
            images = listOf(ByteArray(10)),
            latitude = 40.7128,
            longitude = -74.0060,
            userLatitude = 40.7130,
            userLongitude = -74.0058,
            endDate = LocalDateTime.now().plusDays(1),
            eventTypeId = 1L
        )
    }

    private fun createMockEventResponseDTO(id: Long, name: String): EventResponseDTO {
        return EventResponseDTO(
            id = id,
            name = name,
            description = "Description",
            images = emptyList(),
            latitude = 40.7128,
            longitude = -74.0060,
            reportedDate = LocalDateTime.now(),
            endDate = LocalDateTime.now().plusDays(1),
            isActive = true,
            eventType = EventTypeDTO(1L, "Event Type", "icon", "description"),
            author = AuthorResponseDTO(1L, 5.0),
            rating = 4.5,
            ratingForCurrentUser = 5,
            isAuthor = false
        )
    }

    private fun createMockUserFavouritePlace(userId: Long, placeName: String): UserFavouritePlace {
        return mockk<UserFavouritePlace> {
            every { this@mockk.userId } returns userId
            every { this@mockk.placeName } returns placeName
        }
    }

    private fun createMockUserGlobalPreference(userId: Long, notifyOnEvent: Boolean): UserGlobalPreference {
        return mockk<UserGlobalPreference> {
            every { this@mockk.userId } returns userId
            every { this@mockk.notifyOnEvent } returns notifyOnEvent
        }
    }
    private fun createMockClusterResponseDTO(long: Double, lat: Double, pointCount: Long): ClusterResponseDTO {
        return ClusterResponseDTO(
            longitude = long,
            latitude = lat,
            count = pointCount
        )
    }


}


