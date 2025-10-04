package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.service.dto.ClusterResponseDTO

@Repository
interface EventRepository: JpaRepository<Event, Long>, EventRepositoryCriteriaApi {

    @Query(
        """
        SELECT 
            ST_X(ST_Centroid(ST_Collect(location))) AS longitude,
            ST_Y(ST_Centroid(ST_Collect(location))) AS latitude,
            COUNT(*) AS count
        FROM (
            SELECT 
                e.location,
                ST_ClusterDBSCAN(e.location, :eps, :minpoints) OVER () AS cluster_id
            FROM watchout.events e
            WHERE e.location && ST_MakeEnvelope(:west, :south, :east, :north, 4326)
        ) sub
        WHERE cluster_id IS NOT NULL
        GROUP BY cluster_id
        """,
        nativeQuery = true
    )
    fun calculateClusters(
        @Param("west") west: Double,
        @Param("south") south: Double,
        @Param("east") east: Double,
        @Param("north") north: Double,
        @Param("eps") eps: Double,
        @Param("minpoints") minpoints: Int
    ): List<ClusterResponseDTO>

}