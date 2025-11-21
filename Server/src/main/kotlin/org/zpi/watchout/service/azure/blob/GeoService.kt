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

    fun isUserWithinDistance(eventId: Long, userLat: Double, userLng: Double, maxDistance: Double = 3000.0): Boolean {
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
}