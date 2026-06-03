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