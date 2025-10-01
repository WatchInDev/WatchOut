package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventFilterDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import org.zpi.watchout.service.mapper.EventMapper

@Service
class EventService(val eventRepository: EventRepository, val eventMapper: EventMapper) {

    fun getAllEvents(eventFilterDTO: EventFilterDTO): List<EventResponseDTO> {
        return eventRepository.findByLocation(
            eventFilterDTO.swLng,
            eventFilterDTO.swLat,
            eventFilterDTO.neLng,
            eventFilterDTO.neLat
        )
    }

    fun getEventById(id: Long): EventResponseDTO {
        return eventRepository.findById(id).map { eventMapper.mapToDto(it) }
            .orElseThrow { EntityNotFoundException("Event with id $id not found") }
    }

    fun createEvent(eventRequestDto: EventRequestDTO): EventResponseDTO {
        val event = eventMapper.mapToEntity(eventRequestDto, authorId = 1) // TODO: replace with actual user id from auth
        return eventMapper.mapToDto(eventRepository.save(event))
    }

    fun getClusters(clusterRequestDto: ClusterRequestDTO): List<ClusterResponseDTO> {
        val width = clusterRequestDto.neLng - clusterRequestDto.swLng
        val height = clusterRequestDto.neLat - clusterRequestDto.swLat

        return eventRepository.calculateClusters(clusterRequestDto.swLng,
            clusterRequestDto.swLat,
            clusterRequestDto.neLng,
            clusterRequestDto.neLat,
            width / clusterRequestDto.gridCells,
            height / clusterRequestDto.gridCells)
    }

}