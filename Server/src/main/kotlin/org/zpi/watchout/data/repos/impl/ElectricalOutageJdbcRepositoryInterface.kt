package org.zpi.watchout.data.repos.impl

import org.zpi.watchout.data.entity.ElectricalOutage

interface ElectricalOutageJdbcRepositoryInterface {
    fun batchSave(outages: List<ElectricalOutage>)
}