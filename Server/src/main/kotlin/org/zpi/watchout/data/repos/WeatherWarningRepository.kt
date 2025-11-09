package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.data.entity.WeatherWarning

@Repository
interface WeatherWarningRepository : JpaRepository<WeatherWarning, Long> {
}