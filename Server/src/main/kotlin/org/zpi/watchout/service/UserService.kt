package org.zpi.watchout.service

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.stereotype.Service
import org.springframework.web.bind.MethodArgumentNotValidException
import org.zpi.watchout.data.entity.User
import org.zpi.watchout.data.repos.UserRepository

@Service
class UserService (val userRepository: UserRepository) {

    fun createUser(externalId: String, name: String, lastName: String, email: String, phone: String){
        userRepository.save(User(name, lastName, email, phone, 0.25 , externalId))
    }
}