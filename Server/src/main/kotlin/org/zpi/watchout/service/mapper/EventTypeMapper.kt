package org.zpi.watchout.service.mapper

import org.springframework.stereotype.Component
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.service.dto.EventTypeDTO

@Component
class EventTypeMapper {
    fun mapToDto(eventType: EventType): EventTypeDTO {
        return EventTypeDTO(
            id = eventType.id!!,
            name = eventType.name,
            icon = eventType.icon,
            description = eventType.description
        )
    }
}