package org.zpi.watchout.service

import jakarta.persistence.Id
import org.locationtech.jts.geom.Coordinate
import org.locationtech.jts.geom.GeometryFactory
import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.IncorrectLocationException
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.service.dto.FavouritePlaceDTO
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.GeocodeResponseDTO
import org.zpi.watchout.service.web.GoogleGeocodeClient

@Service
class UserFavouritePlaceService(val userFavouritePlaceRepository: UserFavouritePlaceRepository, val googleGeocodeClient: GoogleGeocodeClient) {
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
        return FavouritePlaceDTO(result)
    }

    fun getFavouritePlaces(userId: Long): List<FavouritePlaceDTO>{
        return userFavouritePlaceRepository.findByUserId(userId).map {
            FavouritePlaceDTO(it)
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