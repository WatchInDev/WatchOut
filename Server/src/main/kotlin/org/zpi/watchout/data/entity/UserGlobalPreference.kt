package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "user_global_preferences", schema = "watchout")
class UserGlobalPreference(
    @Column(name = "place_name", unique = true)
    val userId: Long,
    @Column(name = "notify_on_comment")
    var notifyOnComment: Boolean = true,
    @Column(name = "notify_on_event")
    var notifyOnEvent: Boolean = true,
    @Column(name = "notify_on_external_warning")
    var notifyOnExternalWarning: Boolean = true
) : AbstractEntity() {
}