package org.zpi.watchout.service

import jakarta.persistence.Id
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.GeocodeResponseDTO
import org.zpi.watchout.service.web.GoogleGeocodeClient

@Service
class UserFavouritePlaceService(val userFavouritePlaceRepository: UserFavouritePlaceRepository, val googleGeocodeClient: GoogleGeocodeClient) {
    fun addFavouritePlace(userId: Long, favouritePlaceRequestDTO: FavouritePlaceRequestDTO){
        val response = googleGeocodeClient.getAddressFromCoordinates(favouritePlaceRequestDTO.latitude, favouritePlaceRequestDTO.longitude)
        val components = extractRelevantComponents(response)
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
        userFavouritePlaceRepository.save(favouritePlace)
    }

    fun getFavouritePlaces(userId: Long): List<UserFavouritePlace>{
        return userFavouritePlaceRepository.findByUserId(userId)
    }

    fun removeFavouritePlace(placeId: Long, userId: Long){
        userFavouritePlaceRepository.findByUserId(userId).firstOrNull { it.id == placeId }?.let {
            userFavouritePlaceRepository.delete(it)
        }
    }

    val desiredTypes = setOf(
        "street_number",
        "route",
        "locality",
        "administrative_area_level_2",
        "administrative_area_level_1"
    )

    fun extractRelevantComponents(geoResponse: GeocodeResponseDTO): Map<String, String> {
        val result = geoResponse.results.firstOrNull() ?: return emptyMap()

        return result.address_components
            .filter { component -> component.types.any { it in desiredTypes } }
            .associate { component ->
                val matchingType = component.types.first { it in desiredTypes }
                matchingType to component.short_name
            }
    }

}