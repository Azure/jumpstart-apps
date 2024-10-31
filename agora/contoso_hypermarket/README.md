# Contoso Hypermarket

Add all the development artifacts for Contoso Hypermarket in this folder

## Deploy everything locally

docker compose -f docker-compose-store-db.yml up -d

docker compose -f docker-compose-vision-ai.yml -f docker-compose-main-ui.yml -f docker-compose-store-api.yml up

## Deploy on kubernetes with helm

helm dependency build .\charts\contoso-hypermarket\ --namespace contoso-hypermarket
helm install contoso-hypermarket .\charts\contoso-hypermarket\ --create-namespace --namespace contoso-hypermarket

kubectl apply -f ../cerebral_api/operations/mssql.yaml
kubectl apply -f ../cerebral_api/operations/mssql-setup.yaml
kubectl apply -f ../shopper_insights_api/operations/shopper-insights.yaml
kubectl apply -f ../cerebral_api/operations/cerebral-api.yaml
kubectl apply -f ../cerebral_api/operations/cerebral-simulator.yaml
kubectl apply -f ../cerebral_api/operations/cerebral-simulator-prometheus.yaml
kubectl apply -f ../shopper_insights_api/operations/shopper-insights-prometheus.yaml

## Re-installing

If re-installing with Helm, the influxdb-pvc will not uninstall by itself without patching the finalizer (the default behavior protects against accidental deletion)
kubectl patch pvc influxdb-pvc -p '{"metadata":{"finalizers":null}}'  
kubectl delete pvc influxdb-pvc

### Deploy with yaml

kubectl create ns contoso-hypermarket
kubectl apply -f ../main_ui_backend_api/operations/backend_db.yaml
kubectl apply -f ../cerebral_api/operations/influxdb.yaml
kubectl apply -f ../cerebral_api/operations/mssql.yaml

### Wait for database pods to be ready

kubectl apply -f ../cerebral_api/operations/influxdb-setup.yaml
kubectl apply -f ../cerebral_api/operations/mssql-setup.yaml
kubectl apply -f ../main_ui_backend_api/operations/backend_api.yaml
kubectl apply -f ../footfall_ai_api/operations/footfall.yaml
kubectl apply -f ../shopper_insights_api/operations/shopper-insights.yaml
kubectl apply -f ../cerebral_api/operations/cerebral-api.yaml
kubectl apply -f ../cerebral_api/operations/cerebral-simulator.yaml

kubectl apply -f ../cerebral_api/operations/cerebral-simulator-prometheus.yaml
kubectl apply -f ../shopper_insights_api/operations/shopper-insights-prometheus.yaml
