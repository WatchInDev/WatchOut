package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "comments", schema = "watchout")
class Comment(
    @Column(name = "content", columnDefinition = "TEXT")
    val content: String,
    @ManyToOne
    @JoinColumn(name = "author_id", referencedColumnName = "id")
    val author: User,
    @Column(name = "event_id")
    val eventId: Long,
    @Column(name = "is_deleted")
    var isDeleted: Boolean = false
): AbstractEntity() {
}