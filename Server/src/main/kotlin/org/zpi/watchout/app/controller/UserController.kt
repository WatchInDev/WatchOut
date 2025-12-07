package org.zpi.watchout.app.controller

import io.github.oshai.kotlinlogging.KotlinLogging
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.zpi.watchout.data.entity.UserFavouritePlace
import org.zpi.watchout.service.UserFavouritePlaceService
import org.zpi.watchout.service.UserService
import org.zpi.watchout.service.dto.EditFavouritePlacePreferenceDTO
import org.zpi.watchout.service.dto.EditFavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.FavouritePlaceDTO
import org.zpi.watchout.service.dto.FavouritePlaceRequestDTO
import org.zpi.watchout.service.dto.GlobalPreferencesDTO

private val logger = KotlinLogging.logger {}

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Controller", description = "Endpoints for managing user favourite places and preferences")
class UserController (val userFavouritePlaceService: UserFavouritePlaceService, val userService: UserService) {

    @PostMapping("/favourite-places")
    @PreAuthorize("hasRole('ROLE_USER')")
    fun addFavouritePlace(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long, @RequestBody place: FavouritePlaceRequestDTO):FavouritePlaceDTO {
        logger .info { "Adding favourite place for with cooordinates: (${place.latitude}, ${place.longitude}) for user with id: $userId" }
        val result = userFavouritePlaceService.addFavouritePlace(userId, place)
        logger .info { "Added favourite place for with cooordinates: (${place.latitude}, ${place.longitude}) for user with id: $userId" }
        return result
    }

    @GetMapping("/favourite-places")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation(summary = "Get Favourite Places", description = "Retrieve a list of user's favourite places along with their preferences. radius in meters.")
    fun getFavouritePlaces(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long): List<FavouritePlaceDTO> {
        logger.info { "Getting favourite places for user with id: $userId" }
        val result =  userFavouritePlaceService.getFavouritePlaces(userId)
        logger.info { "Got ${result.size} favourite places for user with id: $userId" }
        return result
    }

    @DeleteMapping("/favourite-places/{placeId}")
    @PreAuthorize("hasRole('ROLE_USER')")
    fun removeFavouritePlace(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long, @PathVariable("placeId")  placeId: Long) {
        logger.info { "Removing favourite place with id: $placeId for user with id: $userId" }
        userFavouritePlaceService.removeFavouritePlace(placeId, userId)
        logger.info { "Removed favourite place with id: $placeId for user with id: $userId" }
    }

    @PutMapping("/favourite-places/{placeId}/preferences")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation(summary = "Edit Favourite Place Preference", description = "Edit all preferences for a specific favourite place. radius in meters. Event types should be provided as a list of event type IDs. send all fields even if not changing them.")
    fun editFavouritePlacePreference(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long, @PathVariable("placeId") placeId: Long, @RequestBody editFavouritePlacePreferenceDTO: EditFavouritePlaceRequestDTO) {
        logger.info { "Editing favourite place preference with id: $placeId for user with id: $userId" }
        userFavouritePlaceService.editFavouritePlacePreference(userId,placeId, editFavouritePlacePreferenceDTO)
        logger.info { "Edited favourite place preference with id: $placeId for user with id: $userId" }
    }

    @PutMapping("/preferences")
    @PreAuthorize("hasRole('ROLE_USER')")
    @Operation(summary = "Edit Global User Preferences", description = "Edit all global preferences for the authenticated user. send all fields even if not changing them.")
    fun editGlobalUserPreferences(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long, @RequestBody globalPreferencesDTO: GlobalPreferencesDTO) {
        logger.info { "Editing global preferences for user with id: $userId" }
        userService.editPreferences(userId, globalPreferencesDTO)
        logger.info { "Edited global preferences for user with id: $userId" }

    }

    @GetMapping("/preferences")
    @PreAuthorize("hasRole('ROLE_USER')")
    fun getGlobalUserPreferences(@Parameter(hidden = true) @AuthenticationPrincipal userId: Long): GlobalPreferencesDTO {
        logger.info { "Getting global preferences for user with id: $userId" }
        val result = userService.getUserGlobalPreferences(userId)
        logger.info { "Got global preferences for user with id: $userId" }
        return result
    }



}