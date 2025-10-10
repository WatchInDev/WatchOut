package org.zpi.watchout.data.repos.impl

import jakarta.persistence.EntityManager
import jakarta.persistence.PersistenceContext
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.Expression
import jakarta.persistence.criteria.JoinType
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.locationtech.jts.geom.Geometry
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.data.entity.EventRating
import org.zpi.watchout.data.entity.EventType
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.EventRepositoryCriteriaApi
import org.zpi.watchout.service.dto.ClusterRequestDTO
import org.zpi.watchout.service.dto.ClusterResponseDTO
import org.zpi.watchout.service.dto.EventGetRequestDTO
import org.zpi.watchout.service.dto.EventResponseDTO
import java.time.LocalDateTime
import kotlin.text.get

@Repository
class EventRepositoryCriteriaApiImpl(@PersistenceContext private val entityManager: EntityManager) : EventRepositoryCriteriaApi {
    override fun findByLocation(
       filters: EventGetRequestDTO
    ): List<EventResponseDTO> {
        val cb = entityManager.criteriaBuilder
        val cq = cb.createQuery(EventResponseDTO::class.java)

        val eventRoot = cq.from(Event::class.java)

        val authorJoin = eventRoot.join<Event, User>("author", JoinType.INNER)
        val eventTypeJoin = eventRoot.join<Event, EventType>("eventType", JoinType.INNER)
        val ratingJoin = eventRoot.join<Event, EventRating>("ratings", JoinType.LEFT)
        val userJoin = ratingJoin.join<EventRating, User>("user", JoinType.LEFT)



        val weightedRatingExpr = cb.coalesce(
            cb.sum(cb.prod(ratingJoin.get<Int>("rating"), userJoin.get<Double>("reputation"))),
            0.0
        ).`as`(Double::class.java)

        // TODO: replace with current user id
        val ratingForCurrentUser = cb.coalesce(
            cb.sum(
                cb.selectCase<Int>()
                    .`when`(cb.equal(userJoin.get<Long>("id"), 6L), ratingJoin.get("rating"))
                .otherwise(0)
        ),
        0
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

                weightedRatingExpr,
                ratingForCurrentUser
            )
        )
        val predicates = generatePredicateWhere(filters, cb, eventRoot)
        cq.where(*predicates.toTypedArray())
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
        val havingPredicates = generatePredicateHaving(filters, cb, eventRoot, weightedRatingExpr)
        cq.having(*havingPredicates.toTypedArray())

        return entityManager.createQuery(cq).resultList
    }

    override fun calculateClusters(
        filters: ClusterRequestDTO,
        eps: Double,
        minpoints: Int
    ): List<ClusterResponseDTO> {
        val cb = entityManager.criteriaBuilder
        val cq = cb.createQuery(Long::class.java)
        val root = cq.from(Event::class.java)

        val ratingJoin = root.join<Event, EventRating>("ratings", JoinType.LEFT)
        val userJoin = ratingJoin.join<EventRating, User>("user", JoinType.LEFT)
        val weightedRatingExpr = cb.coalesce(
            cb.sum(cb.prod(ratingJoin.get<Int>("rating"), userJoin.get<Double>("reputation"))),
            0.0
        ).`as`(Double::class.java)


        cq.select(root.get<Long>("id"))
        val predicates = generatePredicateWhere(filters, cb, root)
        cq.where(*predicates.toTypedArray())
        cq.groupBy(root.get<Long>("id"))
        val havingPredicates = generatePredicateHaving(filters, cb, root, weightedRatingExpr)
        cq.having(*havingPredicates.toTypedArray())

        val filteredIds: List<Long> = entityManager.createQuery(cq).resultList
        if (filteredIds.isEmpty()) {
            return emptyList()
        }

        val sql = """
            SELECT 
                ST_X(ST_Centroid(ST_Collect(location))) AS longitude,
                ST_Y(ST_Centroid(ST_Collect(location))) AS latitude,
                COUNT(*) AS count
            FROM (
                SELECT 
                    e.location,
                    ST_ClusterDBSCAN(e.location, :eps, :minpoints) OVER () AS cluster_id
                FROM watchout.events e
                WHERE e.id = ANY(:ids)
            ) sub
            WHERE cluster_id IS NOT NULL
            GROUP BY cluster_id
        """.trimIndent()

        val query = entityManager.createNativeQuery(sql)
        query.setParameter("eps", eps)
        query.setParameter("minpoints", minpoints)
        query.setParameter("ids", filteredIds.toTypedArray())


        val rawResults = query.resultList as List<Array<Any>>

        return rawResults.map {
            ClusterResponseDTO(
                longitude = (it[0] as Number).toDouble(),
                latitude = (it[1] as Number).toDouble(),
                count = (it[2] as Number).toLong()
            )
        }
    }

    fun generatePredicateWhere(filters: EventGetRequestDTO, cb: CriteriaBuilder, eventRoot:  Root<Event>):  MutableList<Predicate> {
        val predicates = mutableListOf<Predicate>()

        predicates.add(
            cb.isTrue(
                cb.function(
                    "ST_Intersects",
                    Boolean::class.java,
                    eventRoot.get<Geometry>("location"),
                    cb.function(
                        "ST_MakeEnvelope",
                        Geometry::class.java,
                        cb.literal(filters.swLng),
                        cb.literal(filters.swLat),
                        cb.literal(filters.neLng),
                        cb.literal(filters.neLat),
                        cb.literal(4326)
                    )
                )
            )
        )

        filters.eventTypeIds?.let { eventTypeIds ->
            if (eventTypeIds.isNotEmpty()) {
                predicates.add(eventRoot.get<EventType>("eventType").get<Long>("id").`in`(eventTypeIds))
            }
        }

        filters.reportedDateFrom?.let { startDate ->
            predicates.add(cb.greaterThanOrEqualTo(eventRoot.get("reportedDate"), startDate))
        }

        filters.reportedDateTo?.let { endDate ->
            predicates.add(cb.lessThanOrEqualTo(eventRoot.get("endDate"), endDate))
        }

        predicates.add(cb.equal(eventRoot.get<Boolean>("isActive"), true))


        val centerLongitude = (filters.swLng + filters.neLng) / 2.0
        val centerLatitude = (filters.swLat + filters.neLat) / 2.0

        filters.distance?.let { distance ->
            val point = cb.function(
                "ST_SetSRID",
                Geometry::class.java,
                cb.function(
                    "ST_MakePoint",
                    Geometry::class.java,
                    cb.literal(centerLongitude),
                    cb.literal(centerLatitude)
                ),
                cb.literal(4326)
            )
            val withinDistance = cb.function(
                "ST_DWithin",
                Boolean::class.java,
                eventRoot.get<Geometry>("location"),
                point,
                cb.literal(filters.distance)
            )
            predicates.add(cb.isTrue(withinDistance))
        }


        return predicates

    }

    fun generatePredicateWhere(filters: ClusterRequestDTO, cb: CriteriaBuilder, eventRoot:  Root<Event>):  MutableList<Predicate> {
        val predicates = mutableListOf<Predicate>()

        predicates.add(
            cb.isTrue(
                cb.function(
                    "ST_Intersects",
                    Boolean::class.java,
                    eventRoot.get<Geometry>("location"),
                    cb.function(
                        "ST_MakeEnvelope",
                        Geometry::class.java,
                        cb.literal(filters.swLng),
                        cb.literal(filters.swLat),
                        cb.literal(filters.neLng),
                        cb.literal(filters.neLat),
                        cb.literal(4326)
                    )
                )
            )
        )

        filters.eventTypeIds?.let { eventTypeIds ->
            if (eventTypeIds.isNotEmpty()) {
                predicates.add(eventRoot.get<EventType>("eventType").get<Long>("id").`in`(eventTypeIds))
            }
        }

        filters.reportedDateFrom?.let { startDate ->
            predicates.add(cb.greaterThanOrEqualTo(eventRoot.get("reportedDate"), startDate))
        }

        filters.reportedDateTo?.let { endDate ->
            predicates.add(cb.lessThanOrEqualTo(eventRoot.get("endDate"), endDate))
        }

        predicates.add(cb.equal(eventRoot.get<Boolean>("isActive"), true))

        val centerLongitude = (filters.swLng + filters.neLng) / 2.0
        val centerLatitude = (filters.swLat + filters.neLat) / 2.0

        filters.distance?.let { distance ->
            val point = cb.function(
                "ST_SetSRID",
                Geometry::class.java,
                cb.function(
                    "ST_MakePoint",
                    Geometry::class.java,
                    cb.literal(centerLongitude),
                    cb.literal(centerLatitude)
                ),
                cb.literal(4326)
            )
            val withinDistance = cb.function(
                "ST_DWithin",
                Boolean::class.java,
                eventRoot.get<Geometry>("location"),
                point,
                cb.literal(filters.distance)
            )
            predicates.add(cb.isTrue(withinDistance))
        }

        return predicates
    }

    fun generatePredicateHaving(filters: EventGetRequestDTO, cb: CriteriaBuilder, eventRoot:  Root<Event>, rating: Expression<Double>):  MutableList<Predicate> {
        val predicates = mutableListOf<Predicate>()

        filters.rating?.let { minRating ->
            predicates.add(cb.greaterThanOrEqualTo(rating, minRating))
        }

        return predicates
    }

    fun generatePredicateHaving(filters: ClusterRequestDTO, cb: CriteriaBuilder, eventRoot:  Root<Event>, rating: Expression<Double>):  MutableList<Predicate> {
        val predicates = mutableListOf<Predicate>()

        filters.rating?.let { minRating ->
            predicates.add(cb.greaterThanOrEqualTo(rating, minRating))
        }

        return predicates
    }


}
