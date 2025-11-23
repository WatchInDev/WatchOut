package org.zpi.watchout.data.repos.impl

import org.zpi.watchout.data.entity.WeatherWarning

interface WeatherWarningJdbcRepositoryInterface {
    fun batchSave(warnings: List<WeatherWarning>)
}