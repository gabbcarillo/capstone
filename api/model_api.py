import json
import requests

def handler(request):
    try:
        # Parse request JSON
        body = json.loads(request.body)
        text = body.get("text")
        if not text:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No text provided"})
            }

        # Hugging Face Space API endpoint
        HF_URL = "https://huggingface.co/spaces/gabb11/sentiment-analyzer/api/predict/"

        payload = {"data": [text]}
        hf_response = requests.post(HF_URL, json=payload)
        hf_response.raise_for_status()

        # Return Hugging Face JSON directly
        return {
            "statusCode": 200,
            "body": hf_response.text,
            "headers": {"Content-Type": "application/json"}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
