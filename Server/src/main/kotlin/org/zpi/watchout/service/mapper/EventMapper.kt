package org.zpi.watchout.service.mapper

import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.stereotype.Component
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import java.time.LocalDateTime

@Component
class EventMapper(val eventTypeMapper: EventTypeMapper, val eventTypeRepository: EventTypeRepository, val userRepository: UserRepository, val userMapper: UserMapper) {
     fun mapToDto(event: Event): EventResponseDTO {
         return EventResponseDTO(
             id = event.id!!,
             name = event.name,
             description = event.description,
             latitude = event.location.y,
             longitude = event.location.x,
             image = event.image,
             reportedDate = event.reportedDate,
             endDate = event.endDate,
             isActive = event.isActive,
             eventType = eventTypeMapper.mapToDto(event.eventType),
             author = userMapper.mapAuthorUserToDto(event.author),
             rating = 0.0,
             ratingForCurrentUser = 0
         )
     }

    fun mapToEntity(eventRequestDto: EventRequestDTO, authorId: Long): Event {
        return Event(
            name = eventRequestDto.name,
            description = eventRequestDto.description ?: "",
            image = eventRequestDto.image ?: ByteArray(0),
            reportedDate = LocalDateTime.now(),
            endDate = eventRequestDto.endDate,
            isActive = true,
            eventType = eventTypeRepository.findById(eventRequestDto.eventTypeId)
                .orElseThrow { EntityNotFoundException("Event type with id ${eventRequestDto.eventTypeId} not found") },
            author = userRepository.findById(authorId).get(),
            location = GeometryFactory().createPoint((Coordinate(eventRequestDto.longitude, eventRequestDto.latitude))).also{
                it.srid = 4326
            }
        )
    }
}