package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.entity.UserGlobalPreference
import org.zpi.watchout.data.enums.Role
import org.zpi.watchout.data.repos.UserGlobalPreferenceRepository
import org.zpi.watchout.data.repos.UserRepository
import org.zpi.watchout.service.dto.GlobalPreferencesDTO

@Service
class UserService (val userRepository: UserRepository, val userGlobalPreferenceRepository: UserGlobalPreferenceRepository) {


    @Transactional(rollbackFor = [Exception::class])
    fun createUser(externalId: String, name: String, email: String){
        if(userRepository.findByExternalId(externalId).isPresent){
            return
        }
        val user = userRepository.save(User(name, email, 0.25 , externalId))
        userGlobalPreferenceRepository.save(
            UserGlobalPreference(
        user.id!!,
                notifyOnComment = true,
                notifyOnEvent = true,
                notifyOnExternalWarning = true
            )
        )
    }

    fun editPreferences(userId: Long, globalPreferencesDTO: GlobalPreferencesDTO){
        val userGlobalPreference = userGlobalPreferenceRepository.findByUserId(userId)
        if(userGlobalPreference != null){
            userGlobalPreference.notifyOnComment = globalPreferencesDTO.notifyOnComment
            userGlobalPreference.notifyOnEvent = globalPreferencesDTO.notifyOnEvent
            userGlobalPreference.notifyOnExternalWarning = globalPreferencesDTO.notifyOnExternalWarning
            userGlobalPreferenceRepository.save(userGlobalPreference)
        }
    }

    fun getUserGlobalPreferences(userId: Long): GlobalPreferencesDTO {
        val userGlobalPreference = userGlobalPreferenceRepository.findByUserId(userId)?:
        throw EntityNotFoundException("User global preferences not found for user with id $userId")
        return GlobalPreferencesDTO(
            notifyOnComment = userGlobalPreference.notifyOnComment,
            notifyOnEvent = userGlobalPreference.notifyOnEvent,
            notifyOnExternalWarning = userGlobalPreference.notifyOnExternalWarning
        )

    }
}