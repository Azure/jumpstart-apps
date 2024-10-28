sudo docker run -d \
  --name rag-assistant \
  -p 5000:5000 \
  -e CHROMA_HOST=10.0.0.4 \
  -e CHROMA_PORT=8040 \
  -e DOCUMENTS_PATH=/app/documents \
  -e ONNX_MODEL_PATH=/app/cpu_and_mobile/cpu-int4-rtn-block-32-acc-level-4 \
  rag-assistant:latest


  sudo docker logs -f rag-assistant

  sudo docker exec -it rag-assistant bash