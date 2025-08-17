# Spring Boot Backend Setup Guide

This document provides a step-by-step guide for setting up and running the Spring Boot backend application. Following these instructions will ensure you have all the necessary components configured correctly.

## Prerequisites

Before you begin, make sure you have the following installed on your system:

* **Java Development Kit (JDK) 17 or higher**
* **PostgreSQL:** This application uses a PostgreSQL database. You'll need to have the server installed and running.
* **IntelliJ IDEA (optional)** 
* **Maven (optional)** 

## Database Setup

This backend requires a PostgreSQL database named `watchout` to be created manually. You can do this using your preferred PostgreSQL client (like `psql` or pgAdmin) or via the command line.

Open a terminal or command prompt and run the following command to create the database:

```
CREATE DATABASE watchout;
```

## Running the Application

Once the database is configured, you can start the application.

### Using IntelliJ IDEA

1. Open the project in IntelliJ IDEA.

2. In the top-right corner, click on the **Run/Debug Configuration** dropdown and select **Edit Configurations...**.

3. In the Run/Debug Configurations window, select the **Application** configuration for your main class. If one does not exist, you can create a new one by clicking the `+` button.

4. In the **Environment variables** field, click the folder icon to open the variables dialog.

5. Add the following two variables, setting their values to your actual PostgreSQL username and password:

    * `APP_DB_USERNAME`

    * `APP_DB_PASSWORD`

6. Click **OK** to save the configuration.

7. You can now start the application by clicking the green **Run** button.

### From the Command Line

This method uses the build tool to run the application directly from your terminal.

The application connects to the database using environment variables. Before starting the server, you **must** set the database username and password.

* `APP_DB_USERNAME`: Your PostgreSQL database username.

* `APP_DB_PASSWORD`: Your PostgreSQL database password.

Here's how you can set them in a typical terminal environment (like Bash or Zsh):

```
export APP_DB_USERNAME="your_username"
export APP_DB_PASSWORD="your_password"
```

If you are on Windows using Command Prompt, use `set` instead of `export`:

```
set APP_DB_USERNAME=your_username
set APP_DB_PASSWORD=your_password
```

Navigate to the project's root directory and use the Maven Wrapper (`./mvnw`) to run the Spring Boot application:

For Unix-based systems (Linux, macOS), run the following command in your terminal:

```
./mvnw spring-boot:run
```

If you are using Windows, the command will be:

```
.\mvnw.cmd spring-boot:run
```

After running the command above, you should see logs indicating that the application has started. The server will be accessible at `http://localhost:8080`.