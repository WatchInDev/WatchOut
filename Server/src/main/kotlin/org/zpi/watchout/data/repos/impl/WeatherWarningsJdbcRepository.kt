package org.zpi.watchout.data.repos.impl
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.WeatherWarning

import java.sql.Timestamp
@Repository
class WeatherWarningsJdbcRepository(
    private val jdbcTemplate: JdbcTemplate
) : WeatherWarningJdbcRepositoryInterface {
    private val insertSql = """
        INSERT INTO watchout.weather_warnings(region, event, description, from_date, to_date)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (region, event, description, from_date, to_date) DO NOTHING
    """.trimIndent()

    override fun batchSave(warnings: List<WeatherWarning>) {
        jdbcTemplate.batchUpdate(
            insertSql,
            warnings.map { warning ->
                arrayOf(
                    warning.region,
                    warning.event,
                    warning.description,
                    Timestamp.valueOf(warning.fromDate),
                    Timestamp.valueOf(warning.toDate)
                )
            }
        )
    }
}