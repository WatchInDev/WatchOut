package org.zpi.watchout.service.schedule

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.zpi.watchout.service.dto.OutageRecord
import org.zpi.watchout.service.dto.OutagesResponse
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import kotlin.math.log

private val logger = KotlinLogging.logger {}

@Service
class ExternalDataGetSchedule {
//    @Scheduled(cron = "\${scheduler.get.external.data.time}")
    @Scheduled(fixedRate = 60000000)
    fun getExternalData() {
        logger.info { "Fetching external data..." }
        val processBuilder = ProcessBuilder("C:\\Python313\\python.exe", "Microservice/app.py")
        processBuilder.redirectErrorStream(true)
        val process = processBuilder.start()

        val output = BufferedReader(InputStreamReader(process.inputStream)).readText()

        val exitCode = process.waitFor()
        if (exitCode != 0) {
            throw RuntimeException("Python script failed: $output")
        }
        val mapper = jacksonObjectMapper()
        val result =  mapper.readValue<OutagesResponse>(output)
        logger.info { "External data fetched: $result" }
        logger.info { "External data fetched successfully." }
    }
}