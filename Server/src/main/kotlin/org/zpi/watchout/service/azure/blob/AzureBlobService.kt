package org.zpi.watchout.service.azure.blob

import com.azure.storage.blob.BlobContainerClientBuilder
import org.springframework.stereotype.Service
import java.util.Base64

@Service
class AzureBlobService(
    config: AzureBlobStorageConfiguration
) {
    private val client = BlobContainerClientBuilder()
       .connectionString(config.connectionString)
       .containerName(config.containerName)
       .buildClient()

    fun uploadFile(fileName: String, data: ByteArray): String {
        val blobClient = client.getBlobClient(fileName)
        blobClient.upload(data.inputStream(), data.size.toLong(), true)
        return blobClient.blobUrl
    }
}