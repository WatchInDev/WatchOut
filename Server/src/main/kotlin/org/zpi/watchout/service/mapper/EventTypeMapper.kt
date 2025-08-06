package org.zpi.watchout.service.mapper

import org.springframework.stereotype.Component
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.service.dto.EventTypeDto

@Component
class EventTypeMapper {
    fun mapToDto(eventType: EventType): EventTypeDto {
        return EventTypeDto(
            name = eventType.name,
            icon = eventType.icon,
            description = eventType.description
        )
    }
}