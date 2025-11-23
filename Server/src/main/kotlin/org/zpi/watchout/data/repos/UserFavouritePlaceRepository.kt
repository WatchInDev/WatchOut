package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.UserFavouritePlace

@Repository
interface UserFavouritePlaceRepository : JpaRepository<UserFavouritePlace, Long> {
    fun findByUserId(userId: Long): List<UserFavouritePlace>

    @Query("""
        SELECT 
        *
        FROM user_favourite_place
        INNER JOIN user_favourite_place_preference on user_favourite_place.id = user_favourite_place_preference.user_favourite_place_id
        WHERE ST_DWithin(
            point,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
            user_favourite_place_preference.radius / 111320.0
        )
        AND user_favourite_place_preference.notification_enabled = true
    """, nativeQuery = true)
    fun findPlaceByCoordinates(latitude: Double, longitude: Double): List<UserFavouritePlace>
}