package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.service.dto.AdminEventFlatRow
import org.zpi.watchout.service.dto.ClusterResponseDTO

@Repository
interface EventRepository: JpaRepository<Event, Long>, EventRepositoryCriteriaApi {


    @Query(
        value = """
        SELECT 
            e.id AS event_id,
            e.name AS name,
            e.description AS description,
            au.email AS author_email,
            au.id AS author_id,
            e.reported_date AS reported_date,
            e.end_date AS end_date,
            et.name AS event_type,
            e.is_active AS is_active,
            e.image AS images
        FROM watchout.events e
        JOIN watchout.users au ON au.id = e.author_id
        JOIN watchout.event_types et ON et.id = e.event_type_id
        ORDER BY e.id
        """,
        nativeQuery = true
    )
    fun findAllEventsWithCommentsFlat(): List<AdminEventFlatRow>

    @Query(
        value = """
        SELECT 
            e.id AS event_id,
            e.name AS name,
            e.description AS description,
            au.email AS author_email,
            au.id AS author_id,
            e.reported_date AS reported_date,
            e.end_date AS end_date,
            et.name AS event_type,
            e.is_active AS is_active,
            e.image AS images
        FROM watchout.events e
        JOIN watchout.users au ON au.id = e.author_id
        JOIN watchout.event_types et ON et.id = e.event_type_id
        WHERE e.id = :id
        ORDER BY e.id
        """,
        nativeQuery = true
    )
    fun findEventById(id: Long): List<AdminEventFlatRow>

    @Query(
        value = """
        SELECT 
            e.id AS event_id,
            e.name AS name,
            e.description AS description,
            au.email AS author_email,
            au.id AS author_id,
            e.reported_date AS reported_date,
            e.end_date AS end_date,
            et.name AS event_type,
            e.is_active AS is_active,
            e.image AS images
        FROM watchout.events e
        JOIN watchout.users au ON au.id = e.author_id
        JOIN watchout.event_types et ON et.id = e.event_type_id
        WHERE au.id = :userId
        ORDER BY e.id
        """,
        nativeQuery = true
    )
    fun findEventByUserId(userId: Long): List<AdminEventFlatRow>

}