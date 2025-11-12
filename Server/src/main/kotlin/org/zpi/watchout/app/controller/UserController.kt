package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.service.UserFavouritePlaceService
import org.zpi.watchout.service.dto.FavouritePlaceDTO
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/users/favourite-places")
@Tag(name = "User Favourite Places", description = "Management of user's favourite places")
class UserController (val userFavouritePlaceService: UserFavouritePlaceService) {

    @PostMapping
    fun addFavouritePlace(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long, @RequestBody place: FavouritePlaceRequestDTO):FavouritePlaceDTO {
        logger .info { "Adding favourite place for with cooordinates: (${place.latitude}, ${place.longitude}) for user with id: $userId" }
        val result = userFavouritePlaceService.addFavouritePlace(userId, place)
        logger .info { "Added favourite place for with cooordinates: (${place.latitude}, ${place.longitude}) for user with id: $userId" }
        return result
    }

    @GetMapping
    fun getFavouritePlaces(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long): List<FavouritePlaceDTO> {
        return userFavouritePlaceService.getFavouritePlaces(userId)
    }

    @DeleteMapping
    fun removeFavouritePlace(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long,  placeId: Long) {
        userFavouritePlaceService.removeFavouritePlace(userId, placeId)
    }

}