TODO: The RUNNING.md outlines steps needed to run the application separately for the development mode and the production mode.

TODO: For merits, the RUNNING.md also outlines the steps needed to use Kubernetes to run the application with Minikube (or somilar), using kubernetes configuration files created as parts of the passing with merits requirements

### Running the Application

#### Development Mode

To run the application in development mode, follow these steps:

1. Navigate to the root directory of the project.
2. Run the following command to start the application in development mode:

```bash
docker compose -f docker-compose.yml up
```

4. Access the application by navigating to `http://localhost:7800` in your browser.

#### Production Mode

To run the application in production mode, follow these steps:

1. Navigate to the root directory of the project.
2. Run the following command to start the application in production mode:

```bash
docker compose -f docker-compose.prod.yml up
```

4. Access the application by navigating to `http://localhost:7800` in your browser.

#### Kubernetes

To run the application in Kubernetes, follow these steps:
