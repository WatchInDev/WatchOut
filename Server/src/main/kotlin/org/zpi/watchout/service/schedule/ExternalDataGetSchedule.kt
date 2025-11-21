package org.zpi.watchout.service.schedule

import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.ElectricalOutage
import org.zpi.watchout.data.entity.WeatherWarning
import org.zpi.watchout.data.repos.ElectricalOutageRepository
import org.zpi.watchout.data.repos.WeatherWarningRepository
import org.zpi.watchout.data.repos.impl.ElectricalOutagesJdbcRepository
import org.zpi.watchout.data.repos.impl.WeatherWarningsJdbcRepository
import org.zpi.watchout.service.dto.OutageRecord
import org.zpi.watchout.service.dto.OutagesResponse
import org.zpi.watchout.service.dto.WeatherDTO
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import kotlin.math.log

private val logger = KotlinLogging.logger {}

@Service
class ExternalDataGetSchedule(private val weatherWarningRepository: WeatherWarningsJdbcRepository, private val electricalOutageRepository: ElectricalOutagesJdbcRepository) {
    @Scheduled(cron = "\${scheduler.get.external.data.time}")
    fun getElectraElectricalOutageExternalData() {
        logger.info { "Fetching electra electrical outage external data..." }
        val processBuilder = ProcessBuilder("python", "Microservice/scrapers/energa.py")
        processBuilder.redirectErrorStream(true)
        val process = processBuilder.start()

        val output = BufferedReader(InputStreamReader(process.inputStream)).readText()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw RuntimeException("Python script failed: $output")
        }
        val mapper = jacksonObjectMapper()
            .registerModule(JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        val result =  mapper.readValue<OutagesResponse>(output)

        val outagesToSave : MutableList<ElectricalOutage> = mutableListOf<ElectricalOutage>()
        for (key in result.keys) {
            val voivodshipOutages: Map<String, List<OutageRecord>> = result[key] ?: continue
            for (subKey in voivodshipOutages.keys) {
                val outageRecords: List<OutageRecord> = voivodshipOutages[subKey] ?: continue
                for (record in outageRecords) {
                    for(location in record.locations) {
                        val outage = ElectricalOutage(
                            provider = "Electra",
                            voivodeship = key,
                            region = subKey,
                            fromDate = record.interval.from_date,
                            toDate = record.interval.to_date,
                            location = location
                        )
                        outagesToSave.add(outage)
                    }
                }
            }
        }
        electricalOutageRepository.batchSave(outagesToSave)


        logger.info { "External electra electrical outage data fetched successfully." }
    }

        @Scheduled(cron = "\${scheduler.get.external.data.time}")
    fun getTauronElectricalOutageExternalData() {
        logger.info { "Fetching tauron electrical outage external data..." }
        val processBuilder = ProcessBuilder("python", "Microservice/scrapers/tauron.py")
        processBuilder.redirectErrorStream(true)
        val process = processBuilder.start()

        val output = BufferedReader(InputStreamReader(process.inputStream)).readText()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw RuntimeException("Python script failed: $output")
        }
        val mapper = jacksonObjectMapper()
            .registerModule(JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        val result =  mapper.readValue<OutagesResponse>(output)
        val outagesToSave : MutableList<ElectricalOutage> = mutableListOf<ElectricalOutage>()
        for (key in result.keys) {
            val voivodshipOutages: Map<String, List<OutageRecord>> = result[key] ?: continue
            for (subKey in voivodshipOutages.keys) {
                val outageRecords: List<OutageRecord> = voivodshipOutages[subKey] ?: continue
                for (record in outageRecords) {
                    for(location in record.locations) {
                        val outage = ElectricalOutage(
                            provider = "Tauron",
                            voivodeship = key,
                            region = subKey,
                            fromDate = record.interval.from_date,
                            toDate = record.interval.to_date,
                            location = location
                        )
                        outagesToSave.add(outage)
                    }
                }
            }
        }
        electricalOutageRepository.batchSave(outagesToSave)
        logger.info { "External tauron electrical outage data fetched successfully." }
    }


        @Scheduled(cron = "\${scheduler.get.external.data.time}")
    fun getWeatherExternalData() {
        logger.info { "Fetching weather external data..." }
        val processBuilder = ProcessBuilder("python", "Microservice/scrapers/imgw.py")
        processBuilder.redirectErrorStream(true)
        val process = processBuilder.start()

        val output = BufferedReader(InputStreamReader(process.inputStream)).readText()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw RuntimeException("Python script failed: $output")
        }

        val mapper = jacksonObjectMapper()
            .registerModule(JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS)
        val result : List<WeatherDTO> = mapper.readValue(output)

        val weatherWarnings : MutableList<WeatherWarning> = mutableListOf<WeatherWarning>()

        for(event in result) {
            for(region in event.powiaty) {
                val warning = WeatherWarning(
                    region = region,
                    event = event.nazwa_zdarzenia,
                    description = event.tresc,
                    fromDate = event.obowiazuje_od,
                    toDate = event.obowiazuje_do
                )
                weatherWarnings.add(warning)
            }
        }

        weatherWarningRepository.batchSave(weatherWarnings)

        logger.info { "Weather external data fetched successfully." }
    }
}