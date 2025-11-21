package org.zpi.watchout.data.repos.impl

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.ElectricalOutage
import java.sql.Timestamp

@Repository
class ElectricalOutagesJdbcRepository(
    private val jdbcTemplate: JdbcTemplate
) {
    private val insertSql = """
        INSERT INTO watchout.electrical_outages(region, voivodeship, provider, from_date, to_date, location)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT (region, voivodeship, provider, from_date, to_date, location) DO NOTHING
    """.trimIndent()

    fun batchSave(outages: List<ElectricalOutage>) {
        jdbcTemplate.batchUpdate(
            insertSql,
            outages.map { outage ->
                arrayOf(
                    outage.region,
                    outage.voivodeship,
                    outage.provider,
                    Timestamp.valueOf(outage.fromDate),
                    Timestamp.valueOf(outage.toDate),
                    outage.location
                )
            }
        )
    }
}