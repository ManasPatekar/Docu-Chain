from dotenv import load_dotenv
import os

load_dotenv()

PINATA_API_KEY = os.getenv("PINATA_API_KEY")
print("Pinata Key:", PINATA_API_KEY)
