package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import org.zpi.watchout.service.GeoService
import org.zpi.watchout.service.mapper.EventMapper

@Service
class EventService(val eventRepository: EventRepository, val eventMapper: EventMapper, val userFavouritePlaceRepository: UserFavouritePlaceRepository, val notificationService: NotificationService, val userGlobalPreferenceRepository: UserGlobalPreferenceRepository, val reputationService: ReputationService, val geoService: GeoService) {

    fun getAllEvents(eventGetRequestDTO: EventGetRequestDTO, userId:Long): List<EventResponseDTO> {
        return eventRepository.findByLocation(
            eventGetRequestDTO,
            userId,
        )
    }

    fun createEvent(eventRequestDto: EventRequestDTO, userId: Long): EventResponseDTO {
        if(!reputationService.isAbleToPostEvents(userId)){
            throw Exception("User with id $userId is not allowed to report more events today due to low reputation")
        }

        if (!geoService.isUserWithinDistanceByEventCoords(eventRequestDto.latitude, eventRequestDto.longitude, eventRequestDto.userLatitude, eventRequestDto.userLongitude)) {
            throw IllegalArgumentException("User is not within the allowed distance to report this event")
        }

        val event = eventMapper.mapToEntity(eventRequestDto, authorId = userId)

        for (favouritePlace in userFavouritePlaceRepository.findPlaceByCoordinates(eventRequestDto.latitude,eventRequestDto.longitude)){
            val userPreferences = userGlobalPreferenceRepository.findByUserId(favouritePlace.userId)
            if(userPreferences?.notifyOnEvent == true){
                notificationService.createNotification(
                    NotificationType.EVENT,
                    favouritePlace.userId,
                    event.name,
                    favouritePlace.placeName
                )
            }
        }


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
