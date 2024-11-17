# RUNNING.md

## Overview

This document outlines the steps to run the application in different environments, including production and development setups. 

### Prerequisites

- Ensure Docker and Docker Compose are installed on your system.
- Verify necessary environment variables are set in `.env` or `project.env`.

## Running the Application

### 1. Production Environment

To run the application in production mode with Docker Compose, use the `docker-compose.prod.yml` file. This file contains configurations optimized for a production setup.

#### Steps:

1. Build and start the containers in detached mode:

   ```bash
   docker compose -f docker-compose.prod.yml up -d
    ```

2. Build and start the containers in detached mode:

   ```bash
   docker compose -f docker-compose.prod.yml ps
    ```

3. Build and start the containers in detached mode:

   ```bash
   docker compose -f docker-compose.prod.yml logs -f
    ```

4. Build and start the containers in detached mode:

   ```bash
   docker compose -f docker-compose.prod.yml down
    ```

### 1. Development Environment

For development, use the default docker-compose.yml file, which may include additional tools and debugging options.

#### Steps:

1. Build and start the containers in detached mode:

   ```bash
   docker compose up -d
    ```

2. Build and start the containers in detached mode:

   ```bash
   docker compose ps
    ```

3. Build and start the containers in detached mode:

   ```bash
   docker compose logs -f
    ```

4. Build and start the containers in detached mode:

   ```bash
   docker compose down
    ```

### Notes

- **Updating Services:** When making changes to any code or configurations, rebuild the services using:

    ```bash
    docker compose up -d --build # or specify the production file as needed.
    ```

- **Environment Variables:** Customize configurations by modifying the or project.env files according to your setup requirements.