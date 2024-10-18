# Contoso Hypermarket

Add all the development artifacts for Contoso Hypermarket in this folder

## Deploy everything locally

docker compose -f docker-compose-store-db.yml up -d

docker compose -f docker-compose-vision-ai.yml -f docker-compose-main-ui.yml -f docker-compose-store-api.yml up

## Deploy on kubernetes

kubectl create ns contoso-hypermarket
kubectl apply -f ../main_ui/operations/rtsp.yaml
kubectl apply -f ../main_ui_backend_api/operations/backend_db.yaml
kubectl apply -f ../main_ui_backend_api/operations/backend_api.yaml
kubectl apply -f ../footfall_ai_api/operations/footfall.yaml
kubectl apply -f ../main_ui/operations/ui.yaml