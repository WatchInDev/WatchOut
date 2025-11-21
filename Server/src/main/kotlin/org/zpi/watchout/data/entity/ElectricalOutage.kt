package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.zpi.watchout.data.AbstractEntity
import java.time.LocalDateTime

@Entity
@Table(name = "electrical_outages", schema = "watchout")
class ElectricalOutage(
    @Column(name = "provider")
    val provider: String,
    @Column(name = "from_date")
    val fromDate: LocalDateTime,
    @Column(name = "to_date")
    val toDate: LocalDateTime,
    @Column(name = "location")
    val location: String,
    @Column(name = "region")
    val region: String,
    @Column(name = "voivodeship")
    val voivodeship: String
) : AbstractEntity() {

}