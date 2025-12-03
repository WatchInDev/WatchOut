package org.zpi.watchout.service

import org.locationtech.jts.geom.Geometry
import org.locationtech.jts.geom.GeometryFactory
import org.locationtech.jts.geom.Point
import org.locationtech.jts.geom.Coordinate
import org.springframework.stereotype.Service
import jakarta.persistence.EntityManager
import org.zpi.watchout.data.entity.Event

@Service
class GeoService(private val entityManager: EntityManager) {

    fun isUserWithinDistanceByEventId(eventId: Long, userLat: Double, userLng: Double, maxDistance: Double = 3000.0): Boolean {
        val geometryFactory = GeometryFactory()
        val userPoint: Point = geometryFactory.createPoint(Coordinate(userLng, userLat))
        userPoint.srid = 4326

        val cb = entityManager.criteriaBuilder
        val cq = cb.createQuery(Long::class.java)
        val eventRoot = cq.from(Event::class.java)

        val withinDistance = cb.function(
            "ST_DWithin",
            Boolean::class.java,
            eventRoot.get<Geometry>("location"),
            cb.literal(userPoint),
            cb.literal(maxDistance)
        )

        cq.select(eventRoot.get<Long>("id"))
            .where(
                cb.and(
                    cb.equal(eventRoot.get<Long>("id"), eventId),
                    cb.isTrue(withinDistance)
                )
            )

        val result = entityManager.createQuery(cq).resultList
        return result.isNotEmpty()
    }

     fun isUserWithinDistanceByEventCoords(eventLat: Double, eventLng: Double, userLat: Double, userLng: Double, maxDistance: Double = 3000.0): Boolean {
        val sql = """
            SELECT ST_DWithin(
              ST_SetSRID(ST_MakePoint(:eventLng, :eventLat), 4326)::geography,
              ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography,
              :maxDistance
            )
        """.trimIndent()

        val query = entityManager.createNativeQuery(sql)
            .setParameter("eventLng", eventLng)
            .setParameter("eventLat", eventLat)
            .setParameter("userLng", userLng)
            .setParameter("userLat", userLat)
            .setParameter("maxDistance", maxDistance)

        val single = query.singleResult
        return when (single) {
            is Boolean -> single
            is Number -> single.toInt() != 0
            is String -> single.equals("t", ignoreCase = true) || single.equals("true", ignoreCase = true)
            else -> false
        }
    }
}