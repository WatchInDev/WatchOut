package org.zpi.watchout.service.azure.blob

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@ConfigurationProperties("azure-watch-out")
class AzureBlobStorageConfiguration {
    lateinit var connectionString: String
    lateinit var containerName: String
}