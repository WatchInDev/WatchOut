package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "reports", schema = "watchout")
class Report(
    @Column(name="reason", columnDefinition = "TEXT")
    val reason: String,
    @Column(name = "reporter_id")
    val reporterId: Long,
    @Column(name = "reported_user_id")
    val reportedUserId: Long,
    @Column(name = "reported_object_id")
    val reportedObjectId: Long,
    @Column(name = "reported_object")
    val reportedObject: String
): AbstractEntity() {
}