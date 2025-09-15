package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.service.dto.ClusterResponseDTO

@Repository
interface EventRepository: JpaRepository<Event, Long> {

    @Query(
        """
        SELECT
            ST_X(ST_Centroid(ST_Collect(e.location))) as longitude,
            ST_Y(ST_Centroid(ST_Collect(e.location))) as latitude,
            COUNT(e) as count
        FROM watchout.events e
        WHERE e.location && ST_MakeEnvelope(:west, :south, :east, :north, 4326)
        GROUP BY ST_SnapToGrid(e.location, :gridSizeX, :gridSizeY)
        """,
        nativeQuery = true
    )
    fun calculateClusters(
        @Param("west") west: Double,
        @Param("south") south: Double,
        @Param("east") east: Double,
        @Param("north") north: Double,
        @Param("gridSizeX") gridSizeX: Double,
        @Param("gridSizeY") gridSizeY: Double
    ): List<ClusterResponseDTO>


    @Query(
        """
        SELECT * FROM watchout.events e
        WHERE e.location && ST_MakeEnvelope(:west, :south, :east, :north, 4326)
        """,
        nativeQuery = true
    )
    fun findByLocation(
        @Param("west") west: Double,
        @Param("south") south: Double,
        @Param("east") east: Double,
        @Param("north") north: Double
    ) : List<Event>

}