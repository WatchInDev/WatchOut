package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.WeatherWarning
import org.zpi.watchout.service.dto.WeatherWarningDTO

@Repository
interface WeatherWarningRepository : JpaRepository<WeatherWarning, Long> {
    /// This threshold was chosen by god himself, dont change it
    @Query(
        """
            SELECT 
            name, description, from_date, to_date, locality
            FROM watchout.weather_warnings
            WHERE similarity(region, :locality) > 0.4
            AND toDate > now()
            AND fromDate < now()
        """, nativeQuery = true
    )
    fun findWeatherWarningByUsersFavouritePlace(@Param("locality") locality: String): List<WeatherWarningDTO>
}