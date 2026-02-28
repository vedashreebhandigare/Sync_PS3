from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from routes import branches, contractors, leads, menu_catalog, stats, partners
from seed import seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed()
    yield


app = FastAPI(title="Banquet Lead Management API", version="1.0.0", lifespan=lifespan)

# CORS — allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(leads.router)
app.include_router(branches.router)
app.include_router(contractors.router)
app.include_router(menu_catalog.router)
app.include_router(stats.router)
app.include_router(partners.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Banquet Lead Management API"}
