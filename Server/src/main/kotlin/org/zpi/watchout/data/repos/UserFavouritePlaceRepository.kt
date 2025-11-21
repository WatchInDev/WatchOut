package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.UserFavouritePlace

@Repository
interface UserFavouritePlaceRepository : JpaRepository<UserFavouritePlace, Long> {
    fun findByUserId(userId: Long): List<UserFavouritePlace>
}