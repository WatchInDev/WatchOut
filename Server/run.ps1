$env:SPRING_APPLICATION_NAME = "WatchOut"
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://localhost:5432/postgres"
$env:SPRING_DATASOURCE_USERNAME = "postgres"
$env:SPRING_DATASOURCE_PASSWORD = "postgres"
$env:SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT = "org.hibernate.dialect.PostgreSQLDialect"
$env:SPRING_JPA_HIBERNATE_DDL_AUTO = "none"

$env:SPRING_FLYWAY_ENABLED = "true"
$env:SERVER_PORT = "8080"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:SCALAR_URL = "http://localhost:8080/v3/api-docs"
$env:SCALAR_PATH = "/docs"
$env:SCALAR_ENABLED = "true"
$env:SPRINGDOC_SWAGGER_UI_PATH = "/scalar-ui"

.\mvnw.cmd spring-boot:run