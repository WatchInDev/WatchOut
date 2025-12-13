package service.azure.blob

import com.azure.storage.blob.BlobClient
import com.azure.storage.blob.BlobContainerClient
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.zpi.watchout.service.azure.blob.AzureBlobService
import org.zpi.watchout.service.azure.blob.AzureBlobStorageConfiguration
import java.io.InputStream
import java.lang.reflect.Field

class AzureBlobServiceTest {

    private lateinit var service: AzureBlobService
    private val config: AzureBlobStorageConfiguration = AzureBlobStorageConfiguration().apply {
        connectionString = "UseDevelopmentStorage=true"
        containerName = "test-container"
    }

    private val containerClient: BlobContainerClient = mockk(relaxed = true)
    private val blobClient: BlobClient = mockk(relaxed = true)

    @BeforeEach
    fun setUp() {
        service = AzureBlobService(config)
        injectPrivateField(service, "client", containerClient)
    }

    @Test
    fun `uploadFile returns blob url and calls upload with correct args`() {
        val fileName = "path/img.png"
        val data = "hello".toByteArray()

        every { containerClient.getBlobClient(fileName) } returns blobClient
        every { blobClient.blobUrl } returns "https://example.blob.core.windows.net/test-container/path/img.png"
        every { blobClient.upload(any<InputStream>(), data.size.toLong(), true) } returns Unit

        val url = service.uploadFile(fileName, data)

        assertEquals("https://example.blob.core.windows.net/test-container/path/img.png", url)
        verify(exactly = 1) { containerClient.getBlobClient(fileName) }
        verify(exactly = 1) { blobClient.upload(any<InputStream>(), data.size.toLong(), true) }
    }

    @Test
    fun `uploadFile propagates exception from SDK`() {
        val fileName = "bad/file.bin"
        val data = ByteArray(0)

        every { containerClient.getBlobClient(fileName) } returns blobClient
        every { blobClient.upload(any<InputStream>(), any(), any()) } throws RuntimeException("upload failed")

        assertThrows(RuntimeException::class.java) {
            service.uploadFile(fileName, data)
        }
    }

    private fun injectPrivateField(target: Any, fieldName: String, value: Any) {
        val field: Field = target::class.java.getDeclaredField(fieldName)
        field.isAccessible = true
        field.set(target, value)
    }
}