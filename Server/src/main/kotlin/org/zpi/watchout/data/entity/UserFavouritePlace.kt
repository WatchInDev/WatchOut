package org.zpi.watchout.data.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table
import org.locationtech.jts.geom.Point
import org.zpi.watchout.data.AbstractEntity

@Entity
@Table(name = "user_favourite_places", schema = "watchout")
class UserFavouritePlace(
    @Column(name = "user_id")
    val userId: Long,
    @Column(name = "region")
    val region: String,
    @Column(name = "voivodeship")
    val voivodeship: String,
    @Column(name = "location")
    val location : String,
    @Column(name = "locality")
    val locality: String,
    @Column(name = "point", columnDefinition = "geometry(Point, 4326)")
    val point: Point,
    @Column(name = "place_name")
    val placeName: String,
) : AbstractEntity() {

}