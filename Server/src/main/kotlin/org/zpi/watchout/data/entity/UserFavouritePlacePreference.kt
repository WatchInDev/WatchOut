package org.zpi.watchout.data.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "user_favourite_place_references", schema = "watchout")
class UserFavouritePlacePreference(
    @Column(name = "user_favourite_place_id", unique = true)
    val userFavouritePlaceId: Long,
    @ManyToMany
    @JoinTable(name = "user_favourite_place_favourite_places",
        schema = "watchout",
        joinColumns = [jakarta.persistence.JoinColumn(name = "user_favourite_place_preference_id")],
        inverseJoinColumns = [jakarta.persistence.JoinColumn(name = "event_type_id")]
        )
    var eventTypes: List<EventType>,
    @Column(name = "radius")
    var radius: Double,
    @Column(name = "weather")
    var weather : Boolean,
    @Column(name = "electricity")
    var electricity : Boolean,
    @Column(name = "notification_enabled")
    var notificationEnabled: Boolean
):
AbstractEntity() {
}