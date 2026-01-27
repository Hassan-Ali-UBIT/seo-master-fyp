import stripe
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


def get_or_create_stripe_product(name):
    existing_products = stripe.Product.list(limit=100)
    for product in existing_products.auto_paging_iter():
        if product.name == name:
            return product.id
    product = stripe.Product.create(name=name)
    return product.id

def create_stripe_price(amount, product_id, billing_type, billing_period=None, currency="usd"):
    unit_amount = int(float(amount) * 100)

    if billing_type == 'one_time':
        price = stripe.Price.create(
            unit_amount=unit_amount,
            currency=currency,
            product=product_id
        )

    elif billing_type == 'subscription':
        interval = 'month'
        if billing_period == 'yearly':
            interval = 'year'
        elif billing_period == 'monthly':
            interval = 'month'
        elif billing_period == 'other':
            interval = 'month'  # fallback or handle custom logic

        price = stripe.Price.create(
            unit_amount=unit_amount,
            currency=currency,
            recurring={"interval": interval},
            product=product_id
        )
    else:
        raise ValueError(f"Unsupported billing_type: {billing_type}")

    return price.id

def get_stripe_product_id(stripe_price_id):
    """
    Retrieves the product ID associated with a given Stripe price ID.
    Returns the product ID.
    """
    price = stripe.Price.retrieve(stripe_price_id)
    return price.product

def update_stripe_product_name(stripe_price_id, new_name):
    """
    Updates the name of a Stripe product.
    Returns the updated product object.
    """

    # Fetch the original price
    original_price = stripe.Price.retrieve(stripe_price_id)
    # Get the product ID from the price
    stripe_product_id = original_price.product

    updated_product = stripe.Product.modify(
        stripe_product_id,
        name=new_name
    )
    return updated_product

def update_stripe_price_and_product(
    stripe_price_id,
    new_product_name,
    new_amount,
    billing_type,
    billing_period=None,
    currency="usd"
):
    """
    Updates the Stripe product name and creates a new price for it (since prices are immutable).
    Returns the new Stripe price ID.
    """

    # Fetch the original price
    original_price = stripe.Price.retrieve(stripe_price_id)

    # Get associated product
    product_id = original_price.product

    # Update product name
    stripe.Product.modify(
        product_id,
        name=new_product_name
    )

    # Create a new price with updated details
    new_price_id = create_stripe_price(
        amount=new_amount,
        product_id=product_id,
        billing_type=billing_type,
        billing_period=billing_period,
        currency=currency
    )

    return new_price_id

