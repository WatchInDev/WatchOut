package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.EventRating

@Repository
interface EventRatingRepository : JpaRepository<EventRating, Long> {
    @Transactional
    fun deleteByUserIdAndEventId(userId: Long, eventId: Long)

    @Transactional
    @Modifying
    @Query(
        value = """
        INSERT INTO watchout.event_ratings (user_id, event_id, rating)
        VALUES (:userId, :eventId, :rating)
        ON CONFLICT (user_id, event_id)
        DO UPDATE SET rating = EXCLUDED.rating
    """,
        nativeQuery = true
    )
    fun upsertRating(@Param("userId") userId: Long,@Param("eventId") eventId: Long, @Param("rating") rating: Double)
}