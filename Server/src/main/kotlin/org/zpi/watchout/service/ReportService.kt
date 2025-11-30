package org.zpi.watchout.service

import org.springframework.stereotype.Service
import org.zpi.watchout.app.infrastructure.exceptions.EntityNotFoundException
import org.zpi.watchout.data.entity.Report
import org.zpi.watchout.data.repos.CommentRepository
import org.zpi.watchout.data.repos.EventRepository
import org.zpi.watchout.data.repos.ReportRepository
import org.zpi.watchout.service.dto.ReportRequestDTO

@Service
class ReportService(val repository: ReportRepository, val commentRepository: CommentRepository, val eventRepository: EventRepository) {

    fun createReport(reportDto: ReportRequestDTO): Report{
        var reportedUserId: Long?
        if(reportDto.reportedObject == "COMMENT"){
            val comment = commentRepository.findById(reportDto.reportedObjectId)
            if(comment.isEmpty){
                throw EntityNotFoundException("Comment with id ${reportDto.reportedObjectId} does not exist")
            }
            reportedUserId = comment.get().author.id
        } else if(reportDto.reportedObject == "EVENT"){
            val event = eventRepository.findById(reportDto.reportedObjectId)
            if(event.isEmpty){
                throw EntityNotFoundException("Event with id ${reportDto.reportedObjectId} does not exist")
            }
            reportedUserId = event.get().author.id
        } else {
            throw IllegalArgumentException("Reported object must be either COMMENT or EVENT")
        }
        val report = Report(
            reason = reportDto.reason,
            reporterId = reportDto.reporterId,
            reportedUserId = reportedUserId!!,
            reportedObjectId = reportDto.reportedObjectId,
            reportedObject = reportDto.reportedObject
        )
        return repository.save(report)
    }

}