package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.AccessDeniedException
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.service.dto.AbilityToPostDTO
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import org.zpi.watchout.service.GeoService
import org.zpi.watchout.service.azure.blob.AzureBlobService
import org.zpi.watchout.service.dto.EditEventDTO
import org.zpi.watchout.service.dto.ReasonCannotPost
import org.zpi.watchout.service.mapper.EventMapper
import java.util.UUID

@Service
class EventService(val eventRepository: EventRepository, val eventMapper: EventMapper, val userFavouritePlaceRepository: UserFavouritePlaceRepository, val notificationService: NotificationService, val userGlobalPreferenceRepository: UserGlobalPreferenceRepository, val reputationService: ReputationService, val geoService: GeoService, val eventTypeRepository: EventTypeRepository,val  azureBlobService: AzureBlobService) {

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

    fun isAbleToPostEvents(userId: Long, lat: Double, long: Double, eventLat:Double, eventLong:Double): AbilityToPostDTO {
        val ableToPost = reputationService.isAbleToPostEvents(userId)
        return if(ableToPost){
            if(!geoService.isUserWithinDistanceByEventCoords(eventLat, eventLong, lat, long)){
                return AbilityToPostDTO(ReasonCannotPost.DISTANCE_RESTRICTION)
            }
            AbilityToPostDTO(true)
        } else {
            AbilityToPostDTO(ReasonCannotPost.REPUTATION_RESTRICTION)
        }
    }

    fun deactivateEvent(eventId: Long, userId: Long) {
        val event = eventRepository.findById(eventId).orElseThrow {
            EntityNotFoundException("Event with id $eventId does not exist")
        }
        if(event.author.id != userId){
            throw AccessDeniedException("Event with id $eventId does not belong to user with id $userId")
        }
        if(!event.isActive){
            throw IllegalArgumentException("Event with id $eventId is already inactive")
        }
        event.isActive = false
        eventRepository.save(event)
    }


    fun editEvent(eventId: Long, editEventDTO: EditEventDTO, userId: Long): EventResponseDTO {
        val event = eventRepository.findById(eventId).orElseThrow {
                EntityNotFoundException("Event with id $eventId does not exist")
            }
        if(event.author.id != userId){
            throw AccessDeniedException("Event with id $eventId does not belong to user with id $userId")
        }
        event.name = editEventDTO.name
        event.description = editEventDTO.description
        event.eventType = eventTypeRepository.findById(editEventDTO.eventTypeId).orElseThrow {
            EntityNotFoundException("Event type with id ${editEventDTO.eventTypeId} does not exist")
        }
        event.endDate = editEventDTO.endDate
        if(!editEventDTO.imagesToRemove.isNullOrEmpty()){
            editEventDTO.imagesToRemove.forEach {
                item ->
                event.image = event.image.split(",").filter { item != it }.joinToString(",")
            }
        }
        if(!editEventDTO.newImages.isNullOrEmpty()){
            val newimgstr = editEventDTO.newImages.joinToString(",") { image ->
                azureBlobService.uploadFile(
                    "events/image_${UUID.randomUUID()}.png",
                    image
                )
            }
            if(event.image.isEmpty()){
                event.image = newimgstr
            } else{
                event.image = event.image + "," + newimgstr
            }
        }
        val editedEvent = eventRepository.save(event)
        return eventMapper.mapToDto(editedEvent)

    }


    fun getEventsByAuthor(userId: Long): List<EventResponseDTO> {
        val events = eventRepository.findByAuthor(userId)
        return events
    }



}
