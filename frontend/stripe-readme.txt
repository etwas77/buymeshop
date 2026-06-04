usage of stripe.com platform:

customer                            frontend                    backend                     stripe API
- initiates payment
                                    - request payment intent
                                                                - create payment intent
                                                                                            - return client secret
                                                                - send client secret
                                    - gets client secret

----------------------------------- payment process --------------------------------------------------

                                    - collect payment method
                                                                                            - return payment method
                                    - confirm payment intent

----------------------------------- payment result ---------------------------------------------------
                                                                                            - send confirmation
                                    ? success ?
                                    - payment confirmed 
                                                                - payment_intent.succeeded
                                    - show success page
- get results

                                    ? failure ?
                                    - payment failed
                                                                - payment_intent.failed
                                    - show failure page
- get results

response on frontend side:
{
  "id": "pi_3TebdnENL8GEI1LP1dtPjMm4",
  "object": "payment_intent",
  "amount": 40000,
  "amount_details": {
    "tip": {}
  },
  "automatic_payment_methods": null,
  "canceled_at": null,
  "cancellation_reason": null,
  "capture_method": "automatic_async",
  "client_secret": "pi_3TebdnENL8GEI1LP1dtPjMm4_secret_ori00A4SMGcGVVmrZLtoxUCpz",
  "confirmation_method": "automatic",
  "created": 1780580939,
  "currency": "eur",
  "description": null,
  "excluded_payment_method_types": null,
  "last_payment_error": null,
  "livemode": false,
  "next_action": null,
  "payment_method": "pm_1TebdnENL8GEI1LPT8yrveTM",
  "payment_method_configuration_details": null,
  "payment_method_types": [
    "card"
  ],
  "processing": null,
  "receipt_email": null,
  "setup_future_usage": null,
  "shipping": null,
  "source": null,
  "status": "succeeded"
}

on backend side:
- webhook:
    - backend exposes endpoint for stripe
    - that endpoint is registered at stripe dashboard
    - once payment is successful, stripe uses endpoint to deliver confirmation to backend (payment_intent.succeeded)
    - backend verifies and updates order status.
- pull from stripe by intentId:
    - backend calls stripe using intentId
    - backend uses answer for verification after frontend reports success


-----------------
https://dashboard.stripe.com/
can show transactions, configure webhooks etc.
