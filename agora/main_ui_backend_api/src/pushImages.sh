#!/bin/bash
ACRNAME=agacr5bbaf
az acr login --name $ACRNAME
apps=( "main_ui_backend_api/src" "cerebral_api/src" "main_ui/src" "intrusion_detection_api/src" "footfall_ai_api/src" )
for d in "${apps[@]}" ; do
    e=$(echo $d | tr '_' '-')
    echo "Building $e"
    docker build -t agora-$e ./$d
    docker tag agora-$e:latest $ACRNAME.azurecr.io/$e:latest
    docker push $ACRNAME.azurecr.io/$e:latest
done
