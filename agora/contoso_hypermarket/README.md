# Contoso Hypermarket

Add all the development artifacts for Contoso Hypermarket in this folder

## Deploy everything locally

docker compose -f docker-compose-store-db.yml up -d

docker compose -f docker-compose-vision-ai.yml -f docker-compose-main-ui.yml -f docker-compose-store-api.yml up

## Deploy on kubernetes

kubectl create ns contoso-hypermarket

helm install contoso-hypermarket .\charts\contoso-hypermarket\ --namespace contoso-hypermarket

kubectl apply -f ../main_ui_backend_api/operations/backend_db.yaml
kubectl apply -f ../genie_api/operations/influxdb.yaml
kubectl apply -f ../genie_api/operations/mssql.yaml

### wait for database pods to be ready

kubectl apply -f ../genie_api/operations/influxdb-setup.yaml
kubectl apply -f ../genie_api/operations/mssql-setup.yaml
kubectl apply -f ../main_ui_backend_api/operations/backend_api.yaml
kubectl apply -f ../footfall_ai_api/operations/footfall.yaml
kubectl apply -f ../shopper_insights_api/operations/shopper-insights.yaml
kubectl apply -f ../genie_api/operations/genie-api.yaml
kubectl apply -f ../genie_api/operations/genie-simulator.yaml
