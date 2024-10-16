# Contoso Hypermarket

Add all the development artifacts for Contoso Hypermarket in this folder

## Deploy everything locally

docker compose -f docker-compose-store-db.yml up -d

docker compose -f docker-compose-vision-ai.yml -f docker-compose-main-ui.yml -f docker-compose-store-api.yml up

## Deploy on kubernetes

kubectl apply -f ./main_ui/operations/rtsp.yaml
kubectl apply -f ./main_ui/operations/backend_db.yaml
kubectl apply -f ./main_ui/operations/backend_api.yaml

