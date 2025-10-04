from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)  # allow cross-origin requests from your front-end

HF_URL = "https://huggingface.co/spaces/gabb11/sentiment-analyzer/api/predict/"

@app.route("/api/model_api", methods=["POST"])
def model_api():
    data = request.json.get("text")
    if not data:
        return jsonify({"error": "No text provided"}), 400

    payload = {"data": [data]}
    response = requests.post(HF_URL, json=payload)
    return jsonify(response.json())

if __name__ == "__main__":
    app.run(debug=True)
