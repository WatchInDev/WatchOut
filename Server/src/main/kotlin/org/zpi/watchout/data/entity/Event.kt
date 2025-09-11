package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity
import java.time.LocalDateTime

@Entity
@Table(name = "events", schema = "watchout")
class Event(
    @Column(name = "name")
    val name: String,
    @Column(name = "description")
    val description : String,
    @Column(name = "image")
    val image: ByteArray,
    @Column(name = "latitude")
    val latitude: Double,
    @Column(name = "longitude")
    val longitude: Double,
    @Column(name = "reported_date")
    val reportedDate: LocalDateTime,
    @Column(name = "end_date")
    val endDate: LocalDateTime,
    @Column(name = "is_active")
    val isActive: Boolean,
    @ManyToOne
    @JoinColumn(name = "event_type_id", referencedColumnName = "id")
    val eventType: EventType
): AbstractEntity()