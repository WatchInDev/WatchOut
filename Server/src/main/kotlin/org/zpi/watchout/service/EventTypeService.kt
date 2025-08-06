package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.dto.EventTypeDto
import org.zpi.watchout.service.mapper.EventTypeMapper

@Service
class EventTypeService(
    private val eventTypeRepository: EventTypeRepository,
    private val eventTypeMapper: EventTypeMapper
) {

    fun getAllEventTypes(): List<EventTypeDto> {
        return eventTypeRepository.findAll()
            .map { eventType ->
                eventTypeMapper.mapToDto(eventType)
            }
    }

    fun getEventTypeByName(name: String): EventTypeDto? {
        return eventTypeRepository.findByName(name) ?.let { eventType ->
            eventTypeMapper.mapToDto(eventType)
        }
    }
}