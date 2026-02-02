from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import json
import joblib
import torch.nn as nn
from transformers import BertTokenizer, BertModel
import os

# -----------------------
# CONFIG
# -----------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "model")

MODEL_PATH = os.path.join(MODEL_DIR, "bert_bns_model.pth")
TOKENIZER_PATH = os.path.join(MODEL_DIR, "bert_bns_tokenizer")
MLB_PATH = os.path.join(MODEL_DIR, "mlb.pkl")
BNS_JSON_PATH = os.path.join(MODEL_DIR, "bns_final.json")
KEYWORD_RULES_PATH = os.path.join(MODEL_DIR, "keyword_rules.json")

FIR_STORAGE_PATH = os.path.join(BASE_DIR, "saved_firs.json")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("Using device:", device)

# -----------------------
# LOAD DATA
# -----------------------
with open(BNS_JSON_PATH, "r", encoding="utf-8") as f:
    bns_data = json.load(f)

with open(KEYWORD_RULES_PATH, "r", encoding="utf-8") as f:
    KEYWORD_RULES = json.load(f)

mlb = joblib.load(MLB_PATH)
NUM_CLASSES = len(mlb.classes_)
print("Loaded classes:", NUM_CLASSES)

# Ensure FIR storage file exists
if not os.path.exists(FIR_STORAGE_PATH):
    with open(FIR_STORAGE_PATH, "w", encoding="utf-8") as f:
        json.dump([], f)

# -----------------------
# MODEL DEFINITION
# -----------------------
class BERTMultiLabelClassifier(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        self.bert = BertModel.from_pretrained("bert-base-uncased")
        self.dropout = nn.Dropout(0.3)
        self.fc1 = nn.Linear(768, 512)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(512, num_classes)

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        x = self.dropout(outputs.pooler_output)
        x = self.fc1(x)
        x = self.relu(x)
        x = self.dropout(x)
        return self.fc2(x)

model = BERTMultiLabelClassifier(NUM_CLASSES)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

tokenizer = BertTokenizer.from_pretrained(TOKENIZER_PATH)

# -----------------------
# PREDICTION LOGIC
# -----------------------
def predict_bns(text, threshold=0.3, top_k=5):
    text_lower = text.lower()
    results = []

    keyword_sections = set()
    matched_keywords = []

    for kw, sec in KEYWORD_RULES.items():
        if kw in text_lower:
            keyword_sections.add(sec)
            matched_keywords.append(kw)

    for sec in keyword_sections:
        info = bns_data.get(sec, {})
        results.append({
            "section_number": sec,
            "title": info.get("title", ""),
            "description": info.get("description", ""),
            "punishment": info.get("punishment", ""),
            "confidence": 1.0,
            "source": "keyword",
            "matched_keywords": matched_keywords,
            "reasoning": "Matched using direct legal keywords"
        })

    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=512).to(device)

    with torch.no_grad():
        logits = model(inputs["input_ids"], inputs["attention_mask"])
        probs = torch.sigmoid(logits).cpu().numpy()[0]

    top_indices = probs.argsort()[-top_k:][::-1]

    for idx in top_indices:
        sec = mlb.classes_[idx]
        score = probs[idx]

        if score > threshold and sec not in keyword_sections:
            info = bns_data.get(sec, {})
            results.append({
                "section_number": sec,
                "title": info.get("title", ""),
                "description": info.get("description", ""),
                "punishment": info.get("punishment", ""),
                "confidence": float(score),
                "source": "model",
                "matched_keywords": [],
                "reasoning": "Predicted by trained BERT legal classification model"
            })

    return sorted(results, key=lambda x: x["confidence"], reverse=True)

# -----------------------
# FLASK APP
# -----------------------
app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json
    text = f"{data.get('incident_type','')} {data.get('description','')} {data.get('location','')}"
    predictions = predict_bns(text)
    return jsonify({"predictions": predictions})

@app.route("/save_fir", methods=["POST"])
def save_fir():
    fir = request.json

    with open(FIR_STORAGE_PATH, "r", encoding="utf-8") as f:
        all_firs = json.load(f)

    all_firs.append(fir)

    with open(FIR_STORAGE_PATH, "w", encoding="utf-8") as f:
        json.dump(all_firs, f, indent=2)

    return jsonify({"message": "FIR saved"})

@app.route("/get_firs", methods=["GET"])
def get_firs():
    with open(FIR_STORAGE_PATH, "r", encoding="utf-8") as f:
        return jsonify({"firs": json.load(f)})

if __name__ == "__main__":
    app.run(debug=True)
