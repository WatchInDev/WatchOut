package org.zpi.watchout.service.dto

import org.zpi.watchout.data.entity.UserFavouritePlace

data class FavouritePlaceDTO(
    val id: Long,
    val placeName: String,
    val latitude: Double,
    val longitude: Double,
    val location: String,
    val locality: String,
    val region: String,
    val voivodeship: String
) {
    constructor(favouritePlace: UserFavouritePlace) : this(
        id = favouritePlace.id!!,
        placeName = favouritePlace.placeName,
        latitude = favouritePlace.point.y,
        longitude = favouritePlace.point.x,
        location = favouritePlace.location,
        locality = favouritePlace.locality,
        region = favouritePlace.region,
        voivodeship = favouritePlace.voivodeship
    )
}
