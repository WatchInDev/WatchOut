package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Comment

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {

    fun findByEventId(eventId: Long): List<Comment>
}