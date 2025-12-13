package service.mapper

import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.service.mapper.EventTypeMapper
import kotlin.test.Test
import kotlin.test.assertEquals

class EventTypeMapperTest {

    private val eventTypeMapper = EventTypeMapper()

    @Test
    fun `mapToDto should correctly map all fields when ID is present`() {

        val eventTypeName = "Conference"
        val eventTypeIcon = "fa-microphone"
        val eventTypeDescription = "A large gathering for professional discussion."

        val eventType = EventType(
            name = eventTypeName,
            icon = eventTypeIcon,
            description = eventTypeDescription
        )
        eventType.id = 1L

        val dto = eventTypeMapper.mapToDto(eventType)

        assertEquals(eventTypeName, dto.name, "The name should be mapped correctly.")
        assertEquals(eventTypeIcon, dto.icon, "The icon should be mapped correctly.")
        assertEquals(eventTypeDescription, dto.description, "The description should be mapped correctly.")
    }


}