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

An effort was made to create a Kubernetes configuration file for the application. The configuration file is located in the `kubernetes` directory.

1. Build the images for the application by running the following command:

```bash
minikube image build -t qa-api/qa-api -f Dockerfile .
minikube image build -t qa-ui/qa-ui -f Dockerfile .
minikube image build -t llm-api/llm-api -f Dockerfile .
minikube image build -t database-migrations -f Dockerfile flyway/
```

2. Apply the Kubernetes configuration file by running the following command:

```bash
# inside the kubernetes directory
kubectl apply -f database/db-cluster.yaml
# wait for the database to be ready
kubectl get cluster

kubectl apply -f database/migration-job.yaml
kubectl apply -f redis/config.yaml
kubectl apply -f redis/pvc.yaml
kubectl apply -f redis/deployment.yaml
kubectl apply -f redis/service.yaml
kubectl apply -f qa-api/ -R
kubectl apply -f qa-ui/ -R
kubectl apply -f llm-api/ -R
kubectl apply -f nginx/config.yaml
kubectl apply -f nginx/deployment.yaml
kubectl apply -f nginx/service.yaml

kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml --force-conflicts=true --server-side=true

kubectl apply -f monitoring/prometheus_rbac.yaml
kubectl apply -f monitoring/prometheus_instance.yaml
kubectl apply -f monitoring/expose_prometheus.yaml
kubectl apply -f monitoring/service_monitor.yaml

kubectl create deployment grafana --image=docker.io/grafana/grafana:latest 
kubectl expose deployment grafana --port 3000

# to connect grafana to prometheus, we need node-ip
kubectl get nodes -o wide
# scrape the ip address of the node
# in grafana, add a new prometheus datasource with the ip address of the node and port 30900


# to verify
minikube service nginx --url
kubectl port-forward service/nginx 7800:7800
# access the application by navigating to `http://localhost:7800` in your browser
```
