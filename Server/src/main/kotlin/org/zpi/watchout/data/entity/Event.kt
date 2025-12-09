package org.zpi.watchout.data.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity
import java.time.LocalDateTime
import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.Point

@Entity
@Table(name = "events", schema = "watchout")
class Event(
    @Column(name = "name")
    var name: String,
    @Column(name = "description")
    var description : String,
    @Column(name = "image")
    var image: String,
    @Column(name = "reported_date")
    val reportedDate: LocalDateTime,
    @Column(name = "end_date")
    var endDate: LocalDateTime,
    @Column(name = "is_active")
    var isActive: Boolean,
    @ManyToOne
    @JoinColumn(name = "author_id", referencedColumnName = "id")
    val author : User,
    @ManyToOne
    @JoinColumn(name = "event_type_id", referencedColumnName = "id")
    var eventType: EventType,
    @Column(name = "location", columnDefinition = "geometry(Point, 4326)")
    val location: Point,
    @OneToMany(mappedBy = "event", cascade = [CascadeType.ALL], orphanRemoval = true)
    val ratings: List<EventRating> = emptyList()
): AbstractEntity()