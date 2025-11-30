package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.zpi.watchout.data.AbstractEntity
import org.zpi.watchout.data.enums.Role

@Entity
@Table(name = "users", schema = "watchout")
class User(
    @Column(name = "name")
    val name : String,
    @Email
    @Column(name = "email", unique = true)
    val email : String,
    @Min(0)
    @Max(1)
    @Column(name="reputation")
    var reputation : Double,
    @Column(name = "external_id", unique = true)
    val externalId : String,
    @Column(name = "is_blocked")
    var isBlocked : Boolean = false
) : AbstractEntity()
{


}