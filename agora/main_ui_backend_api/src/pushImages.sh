#!/bin/bash
ACRNAME=agacr5bbaf
az acr login --name $ACRNAME
apps=( "main_ui_backend_api/src" "cerebral_api/src" "main_ui/src" "intrusion_detection_api/src" "footfall_ai_api/src" )
for d in "${apps[@]}" ; do
    echo "Building $d"
    docker build -t agora-$d ./$d
    docker tag agora-$d:latest $ACRNAME.azurecr.io/$d:latest
    docker push $ACRNAME.azurecr.io/$d:latest
done
