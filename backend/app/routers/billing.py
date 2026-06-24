from fastapi import APIRouter

router = APIRouter(prefix="/api/billing", tags=["billing"])

PLANS = {
    "free": {"price": 0, "scan_limit": -1, "name": "Gratis"},
}


@router.get("/plans")
def get_plans():
    return PLANS
