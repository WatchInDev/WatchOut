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
import org.zpi.watchout.service.dto.EventTypeDTO

class EventTypeServiceTest {

    private lateinit var eventTypeRepository: EventTypeRepository
    private lateinit var eventTypeMapper: EventTypeMapper
    private lateinit var eventTypeService: EventTypeService

    @BeforeEach
    fun setUp() {
        eventTypeRepository = mockk()
        eventTypeMapper = mockk()
        eventTypeService = EventTypeService(eventTypeRepository, eventTypeMapper)
    }

    @Test
    fun `getAllEventTypes should return empty list when no event types exist`() {
        // Given
        every { eventTypeRepository.findAll() } returns emptyList()

        // When
        val result = eventTypeService.getAllEventTypes()

        // Then
        assertTrue(result.isEmpty())
        verify { eventTypeRepository.findAll() }
        verify(exactly = 0) { eventTypeMapper.mapToDto(any()) }
    }

    @Test
    fun `getAllEventTypes should return mapped DTOs for single event type`() {
        // Given
        val eventType = createMockEventType(1L, "Concert")
        val eventTypeDTO = createEventTypeDTO(1L, "Concert")

        every { eventTypeRepository.findAll() } returns listOf(eventType)
        every { eventTypeMapper.mapToDto(eventType) } returns eventTypeDTO

        // When
        val result = eventTypeService.getAllEventTypes()

        // Then
        assertEquals(1, result.size)
        assertEquals(eventTypeDTO, result[0])
        verify { eventTypeRepository.findAll() }
        verify { eventTypeMapper.mapToDto(eventType) }
    }

    @Test
    fun `getAllEventTypes should return mapped DTOs for multiple event types`() {
        // Given
        val eventType1 = createMockEventType(1L, "Concert")
        val eventType2 = createMockEventType(2L, "Sports")
        val eventType3 = createMockEventType(3L, "Festival")
        val eventTypes = listOf(eventType1, eventType2, eventType3)

        val eventTypeDTO1 = createEventTypeDTO(1L, "Concert")
        val eventTypeDTO2 = createEventTypeDTO(2L, "Sports")
        val eventTypeDTO3 = createEventTypeDTO(3L, "Festival")

        every { eventTypeRepository.findAll() } returns eventTypes
        every { eventTypeMapper.mapToDto(eventType1) } returns eventTypeDTO1
        every { eventTypeMapper.mapToDto(eventType2) } returns eventTypeDTO2
        every { eventTypeMapper.mapToDto(eventType3) } returns eventTypeDTO3

        // When
        val result = eventTypeService.getAllEventTypes()

        // Then
        assertEquals(3, result.size)
        assertEquals(eventTypeDTO1, result[0])
        assertEquals(eventTypeDTO2, result[1])
        assertEquals(eventTypeDTO3, result[2])
        verify { eventTypeRepository.findAll() }
        verify { eventTypeMapper.mapToDto(eventType1) }
        verify { eventTypeMapper.mapToDto(eventType2) }
        verify { eventTypeMapper.mapToDto(eventType3) }
    }

    @Test
    fun `getEventTypeByName should return mapped DTO when event type exists`() {
        // Given
        val eventTypeName = "Concert"
        val eventType = createMockEventType(1L, eventTypeName)
        val eventTypeDTO = createEventTypeDTO(1L, eventTypeName)

        every { eventTypeRepository.findByName(eventTypeName) } returns eventType
        every { eventTypeMapper.mapToDto(eventType) } returns eventTypeDTO

        // When
        val result = eventTypeService.getEventTypeByName(eventTypeName)

        // Then
        assertEquals(eventTypeDTO, result)
        verify { eventTypeRepository.findByName(eventTypeName) }
        verify { eventTypeMapper.mapToDto(eventType) }
    }

    @Test
    fun `getEventTypeByName should throw EntityNotFoundException when event type does not exist`() {
        // Given
        val eventTypeName = "NonExistentType"
        every { eventTypeRepository.findByName(eventTypeName) } returns null

        // When & Then
        val exception = assertThrows<EntityNotFoundException> {
            eventTypeService.getEventTypeByName(eventTypeName)
        }

        assertEquals("Event type with name '$eventTypeName' not found", exception.message)
        verify { eventTypeRepository.findByName(eventTypeName) }
        verify(exactly = 0) { eventTypeMapper.mapToDto(any()) }
    }

    @Test
    fun `getEventTypeByName should handle empty string name`() {
        // Given
        val eventTypeName = ""
        every { eventTypeRepository.findByName(eventTypeName) } returns null

        // When & Then
        val exception = assertThrows<EntityNotFoundException> {
            eventTypeService.getEventTypeByName(eventTypeName)
        }

        assertEquals("Event type with name '$eventTypeName' not found", exception.message)
        verify { eventTypeRepository.findByName(eventTypeName) }
        verify(exactly = 0) { eventTypeMapper.mapToDto(any()) }
    }

    @Test
    fun `getEventTypeByName should handle whitespace-only name`() {
        // Given
        val eventTypeName = "   "
        every { eventTypeRepository.findByName(eventTypeName) } returns null

        // When & Then
        val exception = assertThrows<EntityNotFoundException> {
            eventTypeService.getEventTypeByName(eventTypeName)
        }

        assertEquals("Event type with name '$eventTypeName' not found", exception.message)
        verify { eventTypeRepository.findByName(eventTypeName) }
        verify(exactly = 0) { eventTypeMapper.mapToDto(any()) }
    }

    @Test
    fun `getEventTypeByName should be case sensitive`() {
        // Given
        val eventTypeName = "concert"
        val upperCaseEventType = createMockEventType(1L, "Concert")
        val eventTypeDTO = createEventTypeDTO(1L, "concert")

        // Repository returns null for lowercase but would return something for "Concert"
        every { eventTypeRepository.findByName("concert") } returns null
        every { eventTypeRepository.findByName("Concert") } returns upperCaseEventType

        // When & Then
        val exception = assertThrows<EntityNotFoundException> {
            eventTypeService.getEventTypeByName(eventTypeName)
        }

        assertEquals("Event type with name '$eventTypeName' not found", exception.message)
        verify { eventTypeRepository.findByName("concert") }
        verify(exactly = 0) { eventTypeRepository.findByName("Concert") }
        verify(exactly = 0) { eventTypeMapper.mapToDto(any()) }
    }

    @Test
    fun `getEventTypeByName should handle special characters in name`() {
        // Given
        val eventTypeName = "Rock & Roll"
        val eventType = createMockEventType(1L, eventTypeName)
        val eventTypeDTO = createEventTypeDTO(1L, eventTypeName)

        every { eventTypeRepository.findByName(eventTypeName) } returns eventType
        every { eventTypeMapper.mapToDto(eventType) } returns eventTypeDTO

        // When
        val result = eventTypeService.getEventTypeByName(eventTypeName)

        // Then
        assertEquals(eventTypeDTO, result)
        verify { eventTypeRepository.findByName(eventTypeName) }
        verify { eventTypeMapper.mapToDto(eventType) }
    }

    @Test
    fun `getAllEventTypes should maintain order from repository`() {
        // Given
        val eventType1 = createMockEventType(3L, "Zebra")
        val eventType2 = createMockEventType(1L, "Apple")
        val eventType3 = createMockEventType(2L, "Banana")
        val eventTypes = listOf(eventType1, eventType2, eventType3) // Specific order

        val eventTypeDTO1 = createEventTypeDTO(3L, "Zebra")
        val eventTypeDTO2 = createEventTypeDTO(1L, "Apple")
        val eventTypeDTO3 = createEventTypeDTO(2L, "Banana")

        every { eventTypeRepository.findAll() } returns eventTypes
        every { eventTypeMapper.mapToDto(eventType1) } returns eventTypeDTO1
        every { eventTypeMapper.mapToDto(eventType2) } returns eventTypeDTO2
        every { eventTypeMapper.mapToDto(eventType3) } returns eventTypeDTO3

        // When
        val result = eventTypeService.getAllEventTypes()

        // Then
        assertEquals(3, result.size)
        assertEquals(eventTypeDTO1, result[0]) // Zebra first
        assertEquals(eventTypeDTO2, result[1]) // Apple second
        assertEquals(eventTypeDTO3, result[2]) // Banana third
        verify { eventTypeRepository.findAll() }
    }

    private fun createMockEventType(id: Long, name: String): EventType {
        return mockk<EventType> {
            every { this@mockk.id } returns id
            every { this@mockk.name } returns name
        }
    }

    private fun createEventTypeDTO(id: Long, name: String): EventTypeDTO {
        return EventTypeDTO(
            id = id,
            name = name,
            icon = "icon_$name",
            description = "Description for $name"
        )
    }
}

