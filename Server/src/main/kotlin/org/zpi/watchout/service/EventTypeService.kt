package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.dto.EventTypeDTO
import org.zpi.watchout.service.mapper.EventTypeMapper

@Service
class EventTypeService(
    private val eventTypeRepository: EventTypeRepository,
    private val eventTypeMapper: EventTypeMapper
) {

    fun getAllEventTypes(): List<EventTypeDTO> {
        return eventTypeRepository.findAll()
            .map { eventType ->
                eventTypeMapper.mapToDto(eventType)
            }
    }

    fun getEventTypeByName(name: String): EventTypeDTO {
        return eventTypeRepository.findByName(name)
            ?.let { eventType ->
                eventTypeMapper.mapToDto(eventType)
            } ?: throw EntityNotFoundException("Event type with name '$name' not found")
    }
}