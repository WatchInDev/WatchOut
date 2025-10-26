package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.CommentRating

@Repository
interface CommentRatingRepository : JpaRepository<CommentRating, Long> {
    @Transactional
    fun deleteByUserIdAndCommentId(userId: Long, commentId: Long)

    @Transactional
    @Modifying
    @Query(
        value = """
        INSERT INTO watchout.comment_ratings (user_id, comment_id, rating)
        VALUES (:userId, :commentId, :rating)
        ON CONFLICT (user_id, comment_id)
        DO UPDATE SET rating = EXCLUDED.rating
    """,
        nativeQuery = true
    )
    fun upsertRating(@Param("userId") userId: Long, @Param("commentId") commentId: Long, @Param("rating") rating: Int)
}