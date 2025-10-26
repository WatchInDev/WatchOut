package org.zpi.watchout.app

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.autoconfigure.domain.EntityScan
import org.springframework.boot.runApplication
import org.springframework.context.annotation.ComponentScan
import org.springframework.data.jpa.repository.config.EnableJpaAuditing
import org.springframework.data.jpa.repository.config.EnableJpaRepositories
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@ComponentScan(basePackages = ["org.zpi.watchout"])
@EnableJpaRepositories(basePackages = ["org.zpi.watchout"])
@EntityScan(basePackages = ["org.zpi.watchout"])
@EnableJpaAuditing
@EnableScheduling
class WatchOutApplication

fun main(args: Array<String>) {
    runApplication<WatchOutApplication>(*args)
}
