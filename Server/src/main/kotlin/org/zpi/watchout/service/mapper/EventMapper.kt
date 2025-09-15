package org.zpi.watchout.service.mapper

import org.springframework.stereotype.Component
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.service.dto.EventRequestDto
import org.zpi.watchout.service.dto.EventResponseDto
import java.time.LocalDateTime

@Component
class EventMapper(val eventTypeMapper: EventTypeMapper, val eventTypeRepository: EventTypeRepository) {
     fun mapToDto(event: Event): EventResponseDto {
         return EventResponseDto(
             id = event.id!!,
             name = event.name,
             description = event.description,
             latitude = event.latitude,
             longitude = event.longitude,
             image = event.image,
             reportedDate = event.reportedDate,
             endDate = event.endDate,
             isActive = event.isActive,
             eventType = eventTypeMapper.mapToDto(event.eventType)
         )
     }

    fun mapToEntity(eventRequestDto: EventRequestDto): Event {
        return Event(
            name = eventRequestDto.name,
            description = eventRequestDto.description ?: "",
            image = eventRequestDto.image ?: ByteArray(0),
            latitude = eventRequestDto.latitude,
            longitude = eventRequestDto.longitude,
            reportedDate = LocalDateTime.now(),
            endDate = eventRequestDto.endDate,
            isActive = true,
            eventType = eventTypeRepository.findById(eventRequestDto.eventTypeId)
                .orElseThrow { EntityNotFoundException("Event type with id ${eventRequestDto.eventTypeId} not found") }
        )
    }
}