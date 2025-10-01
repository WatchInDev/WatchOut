package org.zpi.watchout.data.repos.impl

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import jakarta.persistence.criteria.JoinType
import org.locationtech.jts.geom.Geometry
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.EventRating
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.EventRepositoryCriteriaApi
import org.zpi.watchout.service.dto.EventResponseDTO
import java.time.LocalDateTime

@Repository
class EventRepositoryCriteriaApiImpl(@PersistenceContext private val entityManager: EntityManager) : EventRepositoryCriteriaApi {
    override fun findByLocation(
        west: Double,
        south: Double,
        east: Double,
        north: Double
    ): List<EventResponseDTO> {
        val cb = entityManager.criteriaBuilder
        val cq = cb.createQuery(EventResponseDTO::class.java)

        val eventRoot = cq.from(Event::class.java)

        val authorJoin = eventRoot.join<Event, User>("author", JoinType.INNER)
        val eventTypeJoin = eventRoot.join<Event, EventType>("eventType", JoinType.INNER)
        val ratingJoin = eventRoot.join<Event, EventRating>("ratings", JoinType.LEFT)
        val userJoin = ratingJoin.join<EventRating, User>("user", JoinType.LEFT)

        val envelopeFn = cb.function(
            "ST_MakeEnvelope",
            Geometry::class.java,
            cb.literal(west),
            cb.literal(south),
            cb.literal(east),
            cb.literal(north),
            cb.literal(4326)
        )

        val intersectsFn = cb.function(
            "ST_Intersects",
            Boolean::class.java,
            eventRoot.get<Geometry>("location"),
            envelopeFn
        )


        val weightedRatingExpr = cb.coalesce(
            cb.sum(cb.prod(ratingJoin.get<Int>("rating"), userJoin.get<Double>("reputation"))),
            0.0
        )


        cq.select(
            cb.construct(
                EventResponseDTO::class.java,
                eventRoot.get<Long>("id"),
                eventRoot.get<String>("name"),
                eventRoot.get<String>("description"),
                eventRoot.get<ByteArray>("image"),
                eventRoot.get<Geometry>("location"),
                eventRoot.get<LocalDateTime>("reportedDate"),
                eventRoot.get<LocalDateTime>("endDate"),
                eventRoot.get<Boolean>("isActive"),

                eventTypeJoin.get<Long>("id"),
                eventTypeJoin.get<String>("name"),
                eventTypeJoin.get<String>("icon"),
                eventTypeJoin.get<String>("description"),

                authorJoin.get<Long>("id"),
                authorJoin.get<String>("name"),
                authorJoin.get<String>("lastName"),
                authorJoin.get<Double>("reputation"),

                weightedRatingExpr
            )
        )
        cq.where(cb.isTrue(intersectsFn))
        cq.groupBy(
            eventRoot.get<Long>("id"),
            eventRoot.get<String>("name"),
            eventRoot.get<String>("description"),
            eventRoot.get<ByteArray>("image"),
            eventRoot.get<Geometry>("location"),
            eventRoot.get<LocalDateTime>("reportedDate"),
            eventRoot.get<LocalDateTime>("endDate"),
            eventRoot.get<Boolean>("isActive"),

            eventTypeJoin.get<Long>("id"),
            eventTypeJoin.get<String>("name"),
            eventTypeJoin.get<String>("icon"),
            eventTypeJoin.get<String>("description"),

            authorJoin.get<Long>("id"),
            authorJoin.get<String>("name"),
            authorJoin.get<String>("lastName"),
            authorJoin.get<Double>("reputation")
        )

        return entityManager.createQuery(cq).resultList
    }
}