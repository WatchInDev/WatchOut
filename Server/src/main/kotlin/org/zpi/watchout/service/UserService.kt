package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.UserRepository

@Service
class UserService (val userRepository: UserRepository) {

    fun createUser(externalId: String, name: String, email: String){
        if(userRepository.findByExternalId(externalId).isPresent){
            return
        }
        userRepository.save(User(name, email, 0.25 , externalId))
    }
}