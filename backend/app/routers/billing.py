import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import PlanChange
from app.auth import get_current_user

router = APIRouter(prefix="/api/billing", tags=["billing"])

PLANS = {
    "free": {"price": 0, "scan_limit": 80, "name": "Free"},
    "pro": {"price": 599, "scan_limit": 250, "name": "Pro", "stripe_price": "price_placeholder_pro"},
    "unlimited": {"price": 999, "scan_limit": -1, "name": "Unlimited", "stripe_price": "price_placeholder_unlimited"},
}


@router.get("/plans")
def get_plans():
    return PLANS


@router.post("/change")
def change_plan(
    data: PlanChange,
    user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.plan not in PLANS:
        raise HTTPException(status_code=400, detail="Invalid plan")

    if data.plan == "free":
        user.plan = "free"
        user.scan_limit = 80
        db.commit()
        return {"message": "Downgraded to Free"}

    if data.payment_method_id:
        try:
            if not user.stripe_customer_id:
                customer = stripe.Customer.create(
                    email=user.email,
                    payment_method=data.payment_method_id,
                    invoice_settings={"default_payment_method": data.payment_method_id},
                )
                user.stripe_customer_id = customer.id
            else:
                stripe.PaymentMethod.attach(data.payment_method_id, customer=user.stripe_customer_id)
                stripe.Customer.modify(
                    user.stripe_customer_id,
                    invoice_settings={"default_payment_method": data.payment_method_id},
                )

            plan_config = PLANS[data.plan]
            stripe.Subscription.create(
                customer=user.stripe_customer_id,
                items=[{"price": plan_config["stripe_price"]}],
            )

            user.plan = data.plan
            user.scan_limit = plan_config["scan_limit"]
            db.commit()
            return {"message": f"Upgraded to {plan_config['name']}"}
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    raise HTTPException(status_code=400, detail="Payment method required for paid plans")
