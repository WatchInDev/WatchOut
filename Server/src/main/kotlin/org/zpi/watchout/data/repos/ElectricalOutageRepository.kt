package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.ElectricalOutage
import org.zpi.watchout.data.repos.impl.ElectricalOutageJdbcRepositoryInterface
import org.zpi.watchout.service.dto.ElectricalOutageDTO

@Repository
interface ElectricalOutageRepository: JpaRepository<ElectricalOutage, Long> {
    /// These thresholds were chosen by god himself, dont change it
    @Query(
        """
            SELECT 
            location, from_date, to_date, provider
            FROM watchout.electrical_outages
            WHERE similarity(region, :region) > 0.4
            AND similarity(voivodeship, :voivodeship) > 0.4
            AND similarity(location, :location) > 0.8
            AND to_date > now()
            AND from_date < now()
        """, nativeQuery = true
    )
    fun findElectricalOutageByFavouritePlace(@Param("voivodeship")voivodeship: String, @Param("location")location: String, @Param("region") region: String): List<ElectricalOutageDTO>

    @Modifying
    @Transactional
    @Query("DELETE FROM ElectricalOutage")
    fun deleteAllElectricalOutages()

}