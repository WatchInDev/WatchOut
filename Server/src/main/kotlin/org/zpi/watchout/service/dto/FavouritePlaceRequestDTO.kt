package org.zpi.watchout.service.dto

data class FavouritePlaceRequestDTO(
    val placeName: String,
    val latitude: Double,
    val longitude: Double,
    val settings: EditFavouritePlacePreferenceDTO
)


data class EditFavouritePlaceRequestDTO(
    val placeName: String,
    val latitude: Double,
    val longitude: Double,
    val settings: EditFavouritePlacePreferenceDTO
)
