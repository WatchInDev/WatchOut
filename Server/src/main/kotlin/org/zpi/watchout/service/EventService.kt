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


    fun createEvent(eventRequestDto: EventRequestDTO): EventResponseDTO {
        val event = eventMapper.mapToEntity(eventRequestDto, authorId = 6) // TODO: replace with actual user id from auth
        return eventMapper.mapToDto(eventRepository.save(event))
    }

    fun getClusters(clusterRequestDto: ClusterRequestDTO): List<ClusterResponseDTO> {
        return eventRepository.calculateClusters(clusterRequestDto.swLng,
            clusterRequestDto.swLat,
            clusterRequestDto.neLng,
            clusterRequestDto.neLat,
            clusterRequestDto.eps,
            clusterRequestDto.minPoints
        )
    }

}