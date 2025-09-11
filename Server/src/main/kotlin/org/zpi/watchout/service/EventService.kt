package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.service.dto.EventRequestDto
import org.zpi.watchout.service.dto.EventResponseDto
import org.zpi.watchout.service.mapper.EventMapper

@Service
class EventService(val eventRepository: EventRepository, val eventMapper: EventMapper) {

    fun getAllEvents(): List<EventResponseDto> {
        return eventRepository.findAll().map { eventMapper.mapToDto(it) }
    }

    fun getEventById(id: Long): EventResponseDto {
        return eventRepository.findById(id).map { eventMapper.mapToDto(it) }
            .orElseThrow { EntityNotFoundException("Event with id $id not found") }
    }

    fun createEvent(eventRequestDto: EventRequestDto): EventResponseDto {
        val event = eventMapper.mapToEntity(eventRequestDto)
        return eventMapper.mapToDto(eventRepository.save(event))
    }

}