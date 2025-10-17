package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import org.zpi.watchout.service.mapper.EventMapper

@Service
class EventService(val eventRepository: EventRepository, val eventMapper: EventMapper) {

    fun getAllEvents(eventGetRequestDTO: EventGetRequestDTO, userId:Long): List<EventResponseDTO> {
        return eventRepository.findByLocation(
            eventGetRequestDTO,
            userId,
        )
    }

    fun createEvent(eventRequestDto: EventRequestDTO, userId: Long): EventResponseDTO {
        val event = eventMapper.mapToEntity(eventRequestDto, authorId = userId)
        return eventMapper.mapToDto(eventRepository.save(event))
    }

    fun getClusters(clusterRequestDto: ClusterRequestDTO): List<ClusterResponseDTO> {
        return eventRepository.calculateClusters(
            clusterRequestDto,
            clusterRequestDto.eps,
            clusterRequestDto.minPoints
        )
    }

}
