from flask_cors import CORS
import joblib
import re
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

# ---------------------------
# Load models once at the top
# ---------------------------
lr_model = joblib.load("sentiment_model_lr.pkl")
vectorizer = joblib.load("vectorizer_lr.pkl")

MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_NAME)
bert_model = DistilBertForSequenceClassification.from_pretrained(MODEL_NAME)
bert_model.eval()

negation_words = {'not', 'no', 'never'}
intensifiers = {'very', 'extremely', 'really', 'super', 'so', 'too'}

def clean_text(text):
    # same as your current clean_text
    text = text.lower()
    text = re.sub(r'<.*?>', '', text)
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = text.split()
    new_tokens = []
    i = 0
    while i < len(tokens):
        word = tokens[i]
        if word in negation_words and i + 1 < len(tokens):
            new_tokens.append(word + '_' + tokens[i + 1])
            i += 2
            continue
        new_tokens.append(word)
        i += 1
    return ' '.join(new_tokens)

# ---------------------------
# Vercel handler
# ---------------------------
def handler(request):
    try:
        data = request.json
        text = data.get("text", "").strip()
        if not text:
            return {"error": "No text provided"}, 400

        # LR model
        cleaned_text = clean_text(text)
        text_vec = vectorizer.transform([cleaned_text])
        lr_pred = lr_model.predict(text_vec)[0]
        lr_proba = lr_model.predict_proba(text_vec)[0]
        lr_classes = lr_model.classes_

        # DistilBERT
        inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True)
        with torch.no_grad():
            outputs = bert_model(**inputs)
            logits = outputs.logits
            probs = torch.softmax(logits, dim=1).squeeze().tolist()
        bert_proba = {"negative": probs[0], "positive": probs[1], "neutral": 0.0}

        # Combine
        alpha = 0.7
        final_proba = {}
        for cls in lr_classes:
            final_proba[cls] = (
                alpha * lr_proba[list(lr_classes).index(cls)]
                + (1 - alpha) * bert_proba.get(cls, 0.0)
            )

        # Intensifier
        lowered_text = text.lower()
        if any(intens in lowered_text for intens in intensifiers):
            if "bad" in lowered_text or "terrible" in lowered_text or "awful" in lowered_text:
                final_proba["negative"] *= 1.3
            if "good" in lowered_text or "great" in lowered_text or "excellent" in lowered_text:
                final_proba["positive"] *= 1.3

        # Normalize
        total = sum(final_proba.values())
        if total > 0:
            final_proba = {k: v / total for k, v in final_proba.items()}

        final_pred = max(final_proba, key=final_proba.get)
        return {"sentiment": final_pred,
                "confidence": round(float(final_proba[final_pred]), 2),
                "probabilities": final_proba}
    except Exception as e:
        return {"error": str(e)}, 500
