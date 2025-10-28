package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "tokens_fcm", schema = "watchout")
class TokenFCM(
    @Column(name = "token")
    val token: String,
    @Column(name = "user_id", unique = true)
    val userId: Long
): AbstractEntity() {
}