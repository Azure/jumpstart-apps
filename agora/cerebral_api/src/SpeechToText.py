import os
import azure.cognitiveservices.speech as speechsdk 
import jsonify

class STT:
    def __init__(self):
        model_path = os.environ.get('WHISPER_MODEL_PATH')
        if not model_path:
            self.model = None
        else:
            import whisper 
            self.model = whisper.load_model(model_path)

    def recognize_with_whisper(self, audio_file_path):
        try:
            if not self.model:
                print("Whisper model not loaded")
                return jsonify({'error': 'Whisper model not loaded'}), 400
            
            result = self.model.transcribe(audio_file_path)
            recognized_text = result["text"]
            print(f"Whisper recognized: {recognized_text}")
            return jsonify({'text': recognized_text})
        except Exception as e:
            print(f"Error in Whisper recognition: {str(e)}")
            return jsonify({'error': 'Error in speech recognition'}), 400

    @staticmethod
    def recognize_with_azure(audio_file_path):
        try:
            speech_key = os.environ.get('AZURE_AI_SPEECH_KEY', "")
            speech_region = os.environ.get('AZURE_AI_SPEECH_REGION', "eastus2")
            speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=speech_region)
            audio_input = speechsdk.audio.AudioConfig(filename=audio_file_path)
            speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_input)

            result = speech_recognizer.recognize_once()
            return result
           
        except Exception as e:
            print(f"Error in Azure recognition: {str(e)}")
            return speechsdk.CancellationReason.Error