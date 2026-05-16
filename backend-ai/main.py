import os
import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("knot-ai-service")

# Configure Google Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    logger.warning("GEMINI_API_KEY is not set in environmental variables.")
else:
    genai.configure(api_key=API_KEY)

app = FastAPI(
    title="KNOT AI Relationship Intelligence Engine",
    description="Microservice for advanced matchmaking research, attachment style calculation, and RAG coaching.",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ProfileData(BaseModel):
    name: str
    age: int
    bio: str = ""
    occupation: str = ""
    religion: str = ""
    education: str = ""
    culturalBackground: str = ""
    personalValues: List[str] = []
    smoking: str = "Non-smoker"
    drinking: str = "Never"
    maritalStatus: str = "Never Married"
    childrenStatus: str = "No kids"
    marriageTimeline: str = "ASAP"
    willingToRelocate: str = "Maybe"
    childrenPreference: str = "Open to children"
    idealPartnerTraits: List[str] = []
    marriageExpectations: str = ""
    careerGoals: str = ""

class CompatibilityRequest(BaseModel):
    user_a: ProfileData
    user_b: ProfileData

class CompatibilityResponse(BaseModel):
    compatibilityScore: int
    emotionalAlignment: int
    communicationStyle: int
    valuesAlignment: int
    lifestyleCompatibility: int
    relationshipReadiness: int
    strengths: List[str]
    challenges: List[str]
    aiExplanation: str

class InterviewExtractRequest(BaseModel):
    transcript: List[Dict[str, str]] # list of {"role": "user"|"ai", "text": "..."}

class CoachRequest(BaseModel):
    conversation_history: List[Dict[str, str]]
    user_profile: ProfileData
    current_message: str

class ModerationRequest(BaseModel):
    messages: List[Dict[str, str]]

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "KNOT AI Engine"}

@app.post("/compatibility", response_model=CompatibilityResponse)
def calculate_compatibility(request: CompatibilityRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        prompt = f"""
        You are an Elite AI Matchmaking Research Engineer and Behavioral Psychology Expert.
        Analyze the following two profiles for serious marriage compatibility:

        USER A:
        {json.dumps(request.user_a.dict(), indent=2)}

        USER B:
        {json.dumps(request.user_b.dict(), indent=2)}

        Provide a structured, deep analysis of their compatibility. You must return EXACTLY a JSON block with the following fields:
        {{
            "compatibilityScore": integer (0 to 100),
            "emotionalAlignment": integer (0 to 100),
            "communicationStyle": integer (0 to 100),
            "valuesAlignment": integer (0 to 100),
            "lifestyleCompatibility": integer (0 to 100),
            "relationshipReadiness": integer (0 to 100),
            "strengths": [list of 3 key relationship strengths],
            "challenges": [list of 2 potential future friction points],
            "aiExplanation": "A sophisticated, warm, psychologically intelligent 3-4 sentence explanation of why they matched and how they can build together."
        }}
        Do not include markdown tags like ```json or anything else. Return raw JSON.
        """
        
        response = model.generate_content(prompt)
        # Clean potential markdown wrapping
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        
        data = json.loads(text.strip())
        return data
    except Exception as e:
        logger.error(f"Error in compatibility: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/interview/extract")
def extract_interview_data(request: InterviewExtractRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        formatted_transcript = "\n".join([f"{m.get('role', 'unknown')}: {m.get('text', '')}" for m in request.transcript])
        
        prompt = f"""
        You are a Trustworthy AI Conversational Data Extraction specialist.
        Analyze this transcript of a serious relationship onboarding interview:

        {formatted_transcript}

        Extract the following data fields. Be honest and accurate. Return ONLY a raw JSON block:
        {{
            "occupation": "string or empty",
            "education": "string or empty",
            "religion": "string or empty",
            "maritalStatus": "string or empty (e.g. Single, Divorced, Widowed)",
            "willingToRelocate": "string (Yes, No, Maybe)",
            "marriageTimeline": "string (ASAP, 1-2 years, 3+ years)",
            "childrenPreference": "string (Open to children, Wants children, Does not want children, Has children & open, etc.)",
            "smoking": "string (Smoker, Non-smoker, Occasionally)",
            "drinking": "string (Never, Socially, Frequently)",
            "personalityArchetype": "Select from: The Intentional Builder, The Grounded Romantic, The Loyal Partner, The Calm Connector",
            "attachmentStyle": "Select from: Secure, Anxious-Preoccupied, Dismissive-Avoidant, Fearful-Avoidant",
            "readinessScore": integer (0 to 100, estimate emotional readiness for commitment),
            "seriousnessLevel": integer (0 to 100, estimate intention level for marriage vs casual),
            "values": [list of 3 key values extracted like Family, Faith, Career, Personal Growth, etc.]
        }}
        Do not include markdown tags like ```json or anything else. Return raw JSON.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data
    except Exception as e:
        logger.error(f"Error in extraction: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/coach/respond")
def coach_respond(request: CoachRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        history = "\n".join([f"{m.get('role', 'unknown')}: {m.get('text', '')}" for m in request.conversation_history])
        
        prompt = f"""
        You are KNOT's Elite AI Relationship Coach—an empathetic, highly intelligent, warm, and sophisticated marital therapist and behavioral science expert.
        The user is serious about commitment and needs your professional guidance.

        USER PROFILE:
        {json.dumps(request.user_profile.dict(), indent=2)}

        COACHING CONVERSATION HISTORY:
        {history}

        USER'S CURRENT MESSAGE:
        "{request.current_message}"

        Provide a supportive, wise, emotionally secure response (150-250 words) that guides the user toward relationship maturity, emotional safety, and healthy communication. Keep your tone premium, mature, and deeply human.
        """
        
        response = model.generate_content(prompt)
        return {"response": response.text.strip()}
    except Exception as e:
        logger.error(f"Error in coach response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/moderation/check")
def check_moderation(request: ModerationRequest):
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        formatted_messages = "\n".join([f"{m.get('role', 'unknown')}: {m.get('text', '')}" for m in request.messages])
        
        prompt = f"""
        You are a highly sensitive Trust & Safety Moderation AI specializing in detecting romance scams, financial scams, coercion, and emotional abuse in serious dating conversations.
        Analyze the following chat log:

        {formatted_messages}

        Assess if there are markers of:
        - Romance scamming (rushing, asking for money, tragic stories)
        - Financial coercion
        - Hard harassment or sexual assault coercion
        - Catfishing indicators

        Return ONLY a raw JSON block:
        {{
            "status": "SAFE" or "FLAGGED",
            "reason": "Brief reason if FLAGGED, otherwise empty",
            "trustDeduction": integer (0 if SAFE, or points to deduct from trust score like 10, 20, 50, 100),
            "severity": "LOW", "MEDIUM", or "HIGH"
        }}
        Do not include markdown tags like ```json.
        """
        
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data
    except Exception as e:
        logger.error(f"Error in moderation check: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
