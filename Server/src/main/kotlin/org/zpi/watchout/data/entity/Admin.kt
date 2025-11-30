package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "admins", schema = "watchout")
class Admin(
    @Column(name = "external_id", unique = true)
    val externalId : String,
    @Column(name = "name")
    val name : String,
    @Column(name = "email", unique = true)
    val email : String
): AbstractEntity() {
}