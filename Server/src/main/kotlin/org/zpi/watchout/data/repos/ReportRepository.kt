package org.zpi.watchout.data.repos

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import org.zpi.watchout.data.entity.Report

@Repository
interface ReportRepository: JpaRepository<Report, Long> {
}