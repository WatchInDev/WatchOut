package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.zpi.watchout.data.entity.EventType

interface EventTypeRepository : JpaRepository<EventType, Long> {
    fun findByName(name: String): EventType?
}