package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Lob
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "event_types", schema = "watchout")
class EventType() : AbstractEntity() {

    @Column(nullable = false)
    lateinit var name: String

    @Column(nullable = false)
    lateinit var icon: ByteArray

    @Column(nullable = false)
    lateinit var description:String

    constructor(name: String, icon: ByteArray, description:String) : this() {
        this.name = name
        this.icon = icon
        this.description = description
    }
}