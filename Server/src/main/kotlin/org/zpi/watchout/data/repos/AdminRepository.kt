package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Admin
import org.zpi.watchout.data.entity.User
import java.util.Optional

@Repository
interface AdminRepository : JpaRepository<Admin, Long> {
    fun findByExternalId(externalId: String): Optional<Admin>
}