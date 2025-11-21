package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.UserGlobalPreference

@Repository
interface UserGlobalPreferenceRepository : JpaRepository<UserGlobalPreference, Long> {
    fun findByUserId(userId: Long): UserGlobalPreference?
}