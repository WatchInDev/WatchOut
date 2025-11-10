package org.zpi.watchout.service

import jakarta.persistence.Id
import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.UserFavouritePlaceRepository
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO

@Service
class UserFavouritePlaceService(val userFavouritePlaceRepository: UserFavouritePlaceRepository) {
    fun addFavouritePlace(userId: Long, favouritePlaceRequestDTO: FavouritePlaceRequestDTO){

    }
}