package org.zpi.watchout.service.schedule

import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.ReputationService
import org.zpi.watchout.service.UserService

private val logger = KotlinLogging.logger {}

@Service
class ReputationUpdateSchedule(val reputationService: ReputationService,  val userRepository: UserRepository) {
        @Scheduled(cron = "\${scheduler.recalculate.reputation.time}")
    fun updateReputations() {
        logger.info { "Recalculating user reputations..." }
        val users = userRepository.findAll()
        val globalEventAccuracy = reputationService.calculateGlobalEventAccuracy()
        val globalCommentAccuracy = reputationService.calculateGlobalCommentAccuracy()
        for (user in users) {
            val newReputation = reputationService.calculateReputation(user.id!!, globalEventAccuracy, globalCommentAccuracy)
            user.reputation = newReputation
        }
        userRepository.saveAll(users)
        logger.info { "User reputations recalculated. Users updated: ${users.size}" }
    }
}