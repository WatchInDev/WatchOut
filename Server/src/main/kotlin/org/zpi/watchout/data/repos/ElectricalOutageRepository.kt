package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.ElectricalOutage
import org.zpi.watchout.service.dto.ElectricalOutageDTO

@Repository
interface ElectricalOutageRepository: JpaRepository<ElectricalOutage, Long> {
    /// These thresholds were chosen by god himself, dont change it
    @Query(
        """
            SELECT 
            location, from_date, to_date, provider
            FROM wathout.electrical_outages
            WHERE similarity(region, :region) > 0.4
            AND similarity(voivodeship, :voivodeship) > 0.4
            AND similarity(location, :location) > 0.7
            AND toDate > now()
            AND fromDate < now()
        """, nativeQuery = true
    )
    fun findElectricalOutageByFavouritePlace(@Param("voivodeship")voivodeship: String, @Param("location")location: String, @Param("region") region: String): List<ElectricalOutageDTO>

}