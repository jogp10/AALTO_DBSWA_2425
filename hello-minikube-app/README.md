# Submission 17.4
## Setup and Run

1. **Start Minikube**:
    ```bash
    minikube start
    ```

2. **Build the Docker Image**:
    Navigate to the `hello-minikube-app` directory and build the Docker image.
    ```bash
    cd hello-minikube-app
    minikube image build -t my-app -f ./Dockerfile .
    ```

3. **Deploy to Kubernetes**:
    Apply the deployment and service configuration files.
    ```bash
    kubectl apply -f ../kubernetes/hello-minikube-app-deployment.yaml
    kubectl apply -f ../kubernetes/hello-minikube-app-service.yaml
    ```

4. **Access the Application**:
    Get the Minikube service URL:
    ```bash
    minikube service my-app-service --url
    ```

5. **Clean and delete the resources**:
    ```bash
    kubectl delete -f ../kubernetes/hello-minikube-app-deployment.yaml
    kubectl delete -f ../kubernetes/hello-minikube-app-service.yaml
    ```