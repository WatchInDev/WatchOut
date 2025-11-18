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
class UserFavouritePlaceReference(
    @Column(name = "user_favourite_place_id", unique = true)
    val userFavouritePlaceId: Long,
    @OneToMany(fetch = FetchType.LAZY, cascade = [CascadeType.ALL])
    val eventTypes: List<EventType>,
    @Column("radius")
    val radius: Double,
    @Column("external_warnings_types")
    val externalWarningsTypes: List<String>,
    @Column("notification_enabled")
    val notificationEnabled: Boolean
):
AbstractEntity() {
}