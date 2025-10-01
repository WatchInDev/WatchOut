package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "event_ratings", schema = "watchout")
class EventRating(
    @Column(name = "rating")
    @Max(1)
    @Min(-1)
    val rating: Int,
    @ManyToOne
    @JoinColumn(name = "user_id")
    val user: User,
    @ManyToOne
    @JoinColumn(name = "event_id")
    val event: Event
): AbstractEntity() {
}