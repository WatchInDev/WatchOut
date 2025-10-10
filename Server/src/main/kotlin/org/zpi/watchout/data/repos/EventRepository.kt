package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Event
import org.zpi.watchout.service.dto.ClusterResponseDTO

@Repository
interface EventRepository: JpaRepository<Event, Long>, EventRepositoryCriteriaApi {

}