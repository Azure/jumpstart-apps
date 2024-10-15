#!/bin/bash
ACRNAME=agacr5bbaf
az acr login --name $ACRNAME
apps=( "main_ui_backend_api" "cerebral_api" "main_ui" "intrusion_detection_api" "footfall_ai_api" )
for d in "${apps[@]}" ; do
    e=$(echo $d | tr '_' '-')
    echo "Building $e"
    docker build -t agora-$e ./$d/src
    docker tag agora-$e:latest $ACRNAME.azurecr.io/$e:latest
    docker push $ACRNAME.azurecr.io/$e:latest
done
