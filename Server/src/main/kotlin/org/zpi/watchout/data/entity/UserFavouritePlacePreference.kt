package org.zpi.watchout.data.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "user_favourite_place_references", schema = "watchout")
class UserFavouritePlacePreference(
    @Column(name = "user_favourite_place_id", unique = true)
    val userFavouritePlaceId: Long,
    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    var eventTypes: List<EventType>,
    @Column("radius")
    var radius: Double,
    @Column(name = "weather")
    var weather : Boolean,
    @Column(name = "electricity")
    var electricity : Boolean,
    @Column("notification_enabled")
    var notificationEnabled: Boolean
):
AbstractEntity() {
}