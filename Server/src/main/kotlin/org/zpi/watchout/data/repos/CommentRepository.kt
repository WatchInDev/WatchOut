package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Comment
import org.zpi.watchout.service.dto.CommentResponseDTO

@Repository
interface CommentRepository : JpaRepository<Comment, Long> {

    @Query("""
        SELECT new org.zpi.watchout.service.dto.CommentResponseDTO(
            c.id,
            c.content,
            c.eventId,
            new org.zpi.watchout.service.dto.AuthorResponseDTO(
                uAuthor.id,
                uAuthor.name,
                uAuthor.lastName,
                uAuthor.reputation
            ),
            COALESCE(SUM(cr.rating * uRater.reputation), 0.0)
        )
        FROM Comment c
        JOIN c.author uAuthor
        LEFT JOIN CommentRating cr ON cr.comment = c
        LEFT JOIN cr.user uRater
        WHERE c.eventId = :eventId
        GROUP BY c.id, c.content, uAuthor.id, c.eventId, uAuthor.name, uAuthor.lastName, uAuthor.reputation
    """)
    fun findByEventId(eventId: Long): List<CommentResponseDTO>
}