import streamlit as st
import pandas as pd
from datetime import datetime
import requests
import pytz
import json
import numpy as np

usedColumns = ["propertyName",  "propertyYear",  
"rents", 
"rent", "aconto",
"street", "number", "letter", "floor", "door",  "postalCode", "commune",
"area", "rooms", 
"shortId",
"longitude", "latitude",
"availableFromLastUpdated"]

@st.cache_data
def get(prop_names):
    data = {
        "pageSize": 2000,
        "page": 0,
        "filters": {"PropertyName": prop_names},
        "mixedResults": False,
        "orderBy": "Created",
        "orderDirection": "DESC"
        }
    search_url = "https://www.findbolig.nu/api/search"
    
    try:
        with requests.Session() as s:
                r = s.post(search_url, json=data)
                
        res = json.loads(r.content)["results"]
        df = pd.DataFrame(res)
    except Exception as e:
        print(f"Error: {e}")
        csv_url = "https://raw.githubusercontent.com/FPWRasmussen/FindboligData/main/full_findbolig.csv"
        df = pd.read_csv(csv_url)

    df = df[usedColumns]
    
    df['fullAddress'] = (df['street'] + " " +
                        df['number'].astype(str) +
                        df['letter'].fillna('') + ", " +
                        np.where(df['floor'] == 0, 'st', df['floor'].astype(str).fillna('')) + ". " +
                        df['door'].fillna('') + ", " +
                        df['postalCode'].astype(str) + " " +
                        df['commune'])
    
    offset = 0.00001  # Adjust this value to the desired offset
    df["longitude"] = np.where(df["door"] == "TV", df["longitude"] + offset,
                        np.where(df["door"] == "TH", df["longitude"] - offset,
                        df["longitude"]))
    df["url"] = "https://findbolig.nu/residence/" + df["shortId"].astype(str)
    df['availableFromLastUpdated'] = pd.to_datetime(df['availableFromLastUpdated'], format="mixed")
    ref_date = datetime.now(pytz.UTC)
    df['Dage siden opdatering'] = (ref_date - df['availableFromLastUpdated']).dt.days
    df.rename(columns={
        'propertyName': 'Ejendom',
        'propertyYear': 'Opførelsesår',
        'floor': 'Etage',
        'rent': 'Husleje (kr.)',
        'aconto': 'À conto (kr.)',
        'area': 'Areal (kvm)',
        'rooms': 'Værelser',
        'availableFromLastUpdated': 'Sidst opdateret',
        'fullAddress': 'Addresse'
    }, inplace=True)
    return df