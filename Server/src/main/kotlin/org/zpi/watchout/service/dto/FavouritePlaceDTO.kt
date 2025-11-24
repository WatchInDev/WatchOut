package org.zpi.watchout.service.dto

import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.data.entity.UserFavouritePlacePreference

data class ServicesPreferenceDTO(
    val electricity: Boolean,
    val weather : Boolean,
    val eventTypes : List<String>
) {
    constructor(userPreference: UserFavouritePlacePreference) : this(
        electricity = userPreference.electricity,
        weather = userPreference.weather,
        eventTypes = userPreference.eventTypes.map { it.name }
    )
}

data class FavouritePlaceDTO(
    val id: Long,
    val placeName: String,
    val latitude: Double,
    val longitude: Double,
    val location: String,
    val locality: String,
    val region: String,
    val voivodeship: String,
    val services : ServicesPreferenceDTO,
    val radius : Double,
    val notificationsEnable: Boolean,
) {
    constructor(favouritePlace: UserFavouritePlace, userPreference: UserFavouritePlacePreference) : this(
        id = favouritePlace.id!!,
        placeName = favouritePlace.placeName,
        latitude = favouritePlace.point.y,
        longitude = favouritePlace.point.x,
        location = favouritePlace.location,
        locality = favouritePlace.locality,
        region = favouritePlace.region,
        voivodeship = favouritePlace.voivodeship,
        services = ServicesPreferenceDTO(userPreference),
        radius = userPreference.radius,
        notificationsEnable = userPreference.notificationEnabled
    )
}

data class EditFavouritePlacePreferenceDTO(
    val radius : Double,
    val services : EditServicesPreferenceDTO,
    val notificationsEnable: Boolean

)

data class EditServicesPreferenceDTO(
    val electricity: Boolean,
    val weather : Boolean,
    val eventTypes : List<Long>
)


