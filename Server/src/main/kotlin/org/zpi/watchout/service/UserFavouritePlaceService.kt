package org.zpi.watchout.service

import jakarta.persistence.Id
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.app.infrastructure.exceptions.IncorrectLocationException
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.entity.UserFavouritePlacePreference
import org.zpi.watchout.data.repos.EventTypeRepository
import org.zpi.watchout.data.repos.UserFavouritePlacePreferenceRepository
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.service.dto.EditFavouritePlacePreferenceDTO
import org.zpi.watchout.service.dto.FavouritePlaceDTO
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.GeocodeResponseDTO
import org.zpi.watchout.service.web.GoogleGeocodeClient

@Service
class UserFavouritePlaceService(val userFavouritePlaceRepository: UserFavouritePlaceRepository, val googleGeocodeClient: GoogleGeocodeClient, val userFavouritePlacePreferenceRepository: UserFavouritePlacePreferenceRepository, val eventTypeRepository: EventTypeRepository) {
    fun addFavouritePlace(userId: Long, favouritePlaceRequestDTO: FavouritePlaceRequestDTO) : FavouritePlaceDTO{
        val response = googleGeocodeClient.getAddressFromCoordinates(favouritePlaceRequestDTO.latitude, favouritePlaceRequestDTO.longitude)
        val components = extractRelevantComponents(response)
        if(components["route"] == null && components["street_number"] == null){
            throw IncorrectLocationException("Provided coordinates do not correspond to a valid street address.")
        }
        val favouritePlace = UserFavouritePlace(
                    userId = userId,
                    placeName = favouritePlaceRequestDTO.placeName,
                    locality = components["administrative_area_level_2"]!!,
                    location = components["route"] + " " + components["street_number"],
                    region = components["locality"]!!,
                    voivodeship = components["administrative_area_level_1"]!!,
                    point = GeometryFactory().createPoint((Coordinate(favouritePlaceRequestDTO.longitude, favouritePlaceRequestDTO.latitude))).also{
                        it.srid = 4326
                    })
        val result=userFavouritePlaceRepository.save(favouritePlace)
        val preference = UserFavouritePlacePreference(
            userFavouritePlaceId = result.id!!,
            notificationEnabled = favouritePlaceRequestDTO.settings.notificationsEnable,
            radius= favouritePlaceRequestDTO.settings.radius,
            weather = favouritePlaceRequestDTO.settings.services.weather,
            electricity = favouritePlaceRequestDTO.settings.services.electricity,
            eventTypes = favouritePlaceRequestDTO.settings.services.eventTypes.map {
                eventTypeRepository.findById(it).orElseThrow { EntityNotFoundException("Event type with id $it not found")}
            }
        )
        val savedPreferences = userFavouritePlacePreferenceRepository.save(
            preference
        )
        return FavouritePlaceDTO(result, savedPreferences)
    }

    fun editFavouritePlacePreference(userId: Long,placeId: Long, editFavouritePlacePreferenceDTO: EditFavouritePlacePreferenceDTO){
        userFavouritePlaceRepository.findByUserId(userId).firstOrNull { it.id == placeId }
            ?: throw IncorrectLocationException("Favourite place with id $placeId not found for user with id $userId")

        val favouritePlacePreference = userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(placeId)
            ?: throw IncorrectLocationException("Favourite place with id $placeId not found")

        favouritePlacePreference.radius = editFavouritePlacePreferenceDTO.radius
        favouritePlacePreference.notificationEnabled = editFavouritePlacePreferenceDTO.notificationsEnable
        favouritePlacePreference.weather = editFavouritePlacePreferenceDTO.services.weather
        favouritePlacePreference.electricity = editFavouritePlacePreferenceDTO.services.electricity
        favouritePlacePreference.eventTypes = editFavouritePlacePreferenceDTO.services.eventTypes.map {
            eventTypeRepository.findById(it).orElseThrow { EntityNotFoundException("Event type with name $it not found")}
        }

        userFavouritePlacePreferenceRepository.save(favouritePlacePreference)
    }

    fun getFavouritePlaces(userId: Long): List<FavouritePlaceDTO>{
        return userFavouritePlaceRepository.findByUserId(userId).map {
            val preferences = userFavouritePlacePreferenceRepository.findByUserFavouritePlaceId(it.id!!)
            FavouritePlaceDTO(it,preferences!!)
        }
    }

    fun removeFavouritePlace(placeId: Long, userId: Long){
        userFavouritePlaceRepository.findByUserId(userId).firstOrNull { it.id == placeId }?.let {
            userFavouritePlaceRepository.delete(it)
        } ?: throw IncorrectLocationException("Favourite place with id $placeId not found for user with id $userId")
    }

    val desiredTypes = setOf(
        "street_number",
        "route",
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1"
    )

    private fun extractRelevantComponents(geoResponse: GeocodeResponseDTO): Map<String, String> {
        val result = geoResponse.results.firstOrNull() ?: return emptyMap()

        return result.address_components
            .filter { component -> component.types.any { it in desiredTypes } }
            .associate { component ->
                val matchingType = component.types.first { it in desiredTypes }
                matchingType to component.short_name
            }
    }

}