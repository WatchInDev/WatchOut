package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.service.dto.AbilityToPostDTO
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import org.zpi.watchout.service.dto.ReasonCannotPost
import org.zpi.watchout.service.mapper.EventMapper

@Service
class EventService(val eventRepository: EventRepository, val eventMapper: EventMapper, val userFavouritePlaceRepository: UserFavouritePlaceRepository, val notificationService: NotificationService, val userGlobalPreferenceRepository: UserGlobalPreferenceRepository, val reputationService: ReputationService) {

    fun getAllEvents(eventGetRequestDTO: EventGetRequestDTO, userId:Long): List<EventResponseDTO> {
        return eventRepository.findByLocation(
            eventGetRequestDTO,
            userId,
        )
    }

    fun createEvent(eventRequestDto: EventRequestDTO, userId: Long): EventResponseDTO {
        if(!reputationService.isAbleToPostEvents(userId)){
            throw AccessDeniedException("User with id $userId is not allowed to report more events today due to low reputation")
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

    fun isAbleToPostEvents(userId: Long): AbilityToPostDTO {
        val ableToPost = reputationService.isAbleToPostEvents(userId)
        return if(ableToPost){
            AbilityToPostDTO(true)
        } else {
            AbilityToPostDTO(ReasonCannotPost.REPUTATION_RESTRICTION)
        }
    }

}
