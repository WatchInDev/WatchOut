package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Lob
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "event_types", schema = "watchout")
class EventType(
    @Column(name = "name")
    val name: String,
    @Column(name = "icon")
    val icon: String,
    @Column(name = "description")
    val description: String
) : AbstractEntity()