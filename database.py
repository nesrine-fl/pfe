from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# PostgreSQL database configuration
POSTGRES_USER = os.getenv("POSTGRES_USER", "mohamed")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "ZL25htXHKtznO88KHZ7DVKoLUZ81Ywos")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "dpg-d06mrn2li9vc73ehpe80-a.frankfurt-postgres.render.com")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_DB = os.getenv("POSTGRES_DB", "platform_bjve")

# Create PostgreSQL connection URL
SQLALCHEMY_DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"

# Create engine with connection pool settings
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    pool_recycle=1800
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 