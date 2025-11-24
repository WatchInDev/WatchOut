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
        fp.*
        FROM watchout.user_favourite_places fp
        INNER JOIN watchout.user_favourite_place_references fpr on fp.id = fpr.user_favourite_place_id
        WHERE ST_DWithin(
            fp.point,
            ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326),
            fpr.radius / 111320.0
        )
        AND fpr.notification_enabled = true
    """, nativeQuery = true)
    fun findPlaceByCoordinates(latitude: Double, longitude: Double): List<UserFavouritePlace>
}