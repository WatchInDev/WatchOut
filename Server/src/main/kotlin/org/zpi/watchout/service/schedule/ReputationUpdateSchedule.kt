package org.zpi.watchout.service.schedule

import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.ReputationService
import org.zpi.watchout.service.UserService

@Service
class ReputationUpdateSchedule(val reputationService: ReputationService,  val userRepository: UserRepository) {
    @Scheduled(cron = "0 0 0 * * ?")
    fun updateReputations() {
        val users = userRepository.findAll()
        val globalEventAccuracy = reputationService.calculateGlobalEventAccuracy()
        val globalCommentAccuracy = reputationService.calculateGlobalCommentAccuracy()
        for (user in users) {
            val newReputation = reputationService.calculateReputation(user.id!!, globalEventAccuracy, globalCommentAccuracy)
            user.reputation = newReputation
        }
        userRepository.saveAll(users)
    }
}