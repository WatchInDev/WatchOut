package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity
import java.time.LocalDateTime

@Entity
@Table(name = "weather_warnings", schema = "watchout")
class WeatherWarning(
    @Column(name = "region")
    val region: String,
    @Column(name = "event")
    val event : String,
    @Column(name = "description")
    val description : String,
    @Column(name = "from_date")
    val fromDate: LocalDateTime,
    @Column(name = "to_date")
    val toDate: LocalDateTime,
) : AbstractEntity() {
}