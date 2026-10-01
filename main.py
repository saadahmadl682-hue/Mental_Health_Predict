import joblib
from fastapi import FastAPI 
from pydantic import BaseModel,Field
import pandas as pd
from typing import Literal
from fastapi.middleware.cors import CORSMiddleware


model = joblib.load('Mental_Health_Score.pkl')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*']
)

class StudentData(BaseModel):
    Age                    : int = Field(...,ge=10,le=100)
    Gender                 : Literal['Male','Female']
    Country               : str
    Academic_Level        : Literal['Undergraduate', 'Graduate', 'High School']
    Most_Used_Platform     : Literal['Facebook', 'LinkedIn', 'Instagram', 'Snapchat', 'Twitter',
       'YouTube', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp',
       'WeChat']
    Purpose_Of_Use       : Literal['Networking', 'Education', 'Entertainment', 'News']
    Avg_Daily_Usage_Hours  : float = Field(...,ge = 6, le = 24)
    Daily_Unlocks         : int = Field(...,ge = 0,le = 1000)
    Study_Hours           : float = Field(...,ge = 0, le = 24)
    Physical_Activity_Hours: float = Field(...,ge = 0, le = 24)
    Sleep_Hours_Per_Night : float = Field(...,ge = 0, le = 24)
    Stress_Level           : Literal['Medium', 'Low', 'Very High', 'High']

class PredictionResponse(BaseModel):
    mental_health_score: float

top_countries = ['Other','India','USA','Canada','Australia','UK','Germany','Mexico','Turkey','France']

@app.get('/')

def greet():
    return {'Oh yes daddy'}

@app.post('/predict')

def predict(data :StudentData, response = PredictionResponse):

    country_group = ''
    if data.Country in top_countries:
        country_group = data.Country
    elif data.Country not in top_countries:
        country_group = 'Other'
    input_row = pd.DataFrame([{
        'Age' : data.Age,
        'Gender': data.Gender,
        'Country': data.Country,
        'Academic_Level': data.Academic_Level,
        'Most_Used_Platform': data.Most_Used_Platform,
        'Purpose_Of_Use': data.Purpose_Of_Use,
        'Avg_Daily_Usage_Hours': data.Avg_Daily_Usage_Hours,
        'Daily_Unlocks': data.Daily_Unlocks,
        'Study_Hours': data.Study_Hours,
        'Physical_Activity_Hours': data.Physical_Activity_Hours,
        'Sleep_Hours_Per_Night': data.Sleep_Hours_Per_Night,
        'Stress_Level': data.Stress_Level,
        'Grouped_Countries': country_group
    }])

    prediction = model.predict(input_row)[0]
    return PredictionResponse(mental_health_score=float(prediction))