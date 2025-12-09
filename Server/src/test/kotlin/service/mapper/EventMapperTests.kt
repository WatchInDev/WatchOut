package service.mapper

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.Mockito.verify
import org.mockito.Mockito.anyString
import org.mockito.junit.jupiter.MockitoExtension
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.azure.blob.AzureBlobService
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventTypeDTO
import org.zpi.watchout.service.mapper.EventMapper
import org.zpi.watchout.service.mapper.EventTypeMapper
import org.zpi.watchout.service.mapper.UserMapper
import java.time.LocalDateTime
import java.util.*

@ExtendWith(MockitoExtension::class)
class EventMapperTest {

    private val eventTypeMapper: EventTypeMapper = mock(EventTypeMapper::class.java)
    private val eventTypeRepository: EventTypeRepository = mock(EventTypeRepository::class.java)
    private val userRepository: UserRepository = mock(UserRepository::class.java)
    private val userMapper: UserMapper = mock(UserMapper::class.java)
    private val azureBlobService: AzureBlobService = mock(AzureBlobService::class.java)

    private val eventMapper = EventMapper(eventTypeMapper, eventTypeRepository, userRepository, userMapper, azureBlobService)

    @Test
    fun `mapToDto correctly maps all fields with images`() {
        val author = mock(User::class.java)
        val eventType = mock(EventType::class.java)
        val eventTypeDto = EventTypeDTO(1L,"ALERT","ALERT","ALERT")
        val reportedDate = LocalDateTime.of(2025, 11, 30, 10, 0)
        val endDate = LocalDateTime.of(2025, 12, 1, 10, 0)

        val location = GeometryFactory().createPoint((Coordinate(30.0,30.0))).also{
            it.srid = 4326
        }

        val event = Event(
            name = "Fire",
            description = "Fire incident",
            image = "img1.png,img2.png",
            reportedDate = reportedDate,
            endDate = endDate,
            isActive = true,
            eventType = eventType,
            author = author,
            location = location
        ).apply {
            id = 10L
        }

        `when`(eventTypeMapper.mapToDto(eventType)).thenReturn(eventTypeDto)

        val result = eventMapper.mapToDto(event)

        assertEquals(10L, result.id)
        assertEquals("Fire", result.name)
        assertEquals("Fire incident", result.description)
        assertEquals(30.0, result.latitude)
        assertEquals(30.0, result.longitude)
        assertEquals(listOf("img1.png", "img2.png"), result.images)
        assertEquals(reportedDate, result.reportedDate)
        assertEquals(endDate, result.endDate)
        assertEquals(true, result.isActive)
        assertEquals(eventTypeDto, result.eventType)
        assertEquals(0.0, result.rating)
        assertEquals(0, result.ratingForCurrentUser)
        assertEquals(true, result.isAuthor)
    }

    @Test
    fun `mapToDto handles empty image string`() {
        val author = mock(User::class.java)
        val eventType = mock(EventType::class.java)
        val eventTypeDto = EventTypeDTO(1L,"ALERT","ALERT","ALERT")

        val location = GeometryFactory().createPoint((Coordinate(30.0,30.0))).also{
            it.srid = 4326
        }

        val event = Event(
            name = "Event",
            description = "Desc",
            image = "",
            reportedDate = LocalDateTime.now(),
            endDate = LocalDateTime.now(),
            isActive = true,
            eventType = eventType,
            author = author,
            location = location
        ).apply { id = 1L }

        `when`(eventTypeMapper.mapToDto(eventType)).thenReturn(eventTypeDto)

        val result = eventMapper.mapToDto(event)

        assertEquals(emptyList<String>(), result.images)
    }

}