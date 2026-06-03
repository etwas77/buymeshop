import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getUserById, UserState } from "../../store/features/userSlice";
import { AppDispatch } from "../../store/store";
import { cartState, getUserCarts, resetCart } from "../../store/features/cartSlice";
import { useElements, useStripe, CardElement } from "@stripe/react-stripe-js";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { PaymentIntentResult } from "@stripe/stripe-js/dist/stripe-js/stripe";
import _ from "lodash";
import { PaymentMethodCreateParams } from "@stripe/stripe-js/dist/api/payment-methods";
import { placeOrder } from "../../store/features/orderSlice";


const Checkout = () => {
    const { userId } = useParams();
    const { user } = useSelector((state: { user: UserState }) => state.user);
    const { cart } = useSelector((state: { cart: cartState }) => state.cart);
    const dispatch = useDispatch<AppDispatch>();

    const stripe = useStripe();
    const elements = useElements();
    const [cardError, setCardError] = React.useState<string>();
    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

    console.log('cart', cart);
    console.log('user', user);


    React.useEffect(() => {
        if (user === undefined) {
            if (userId && !isNaN(Number(userId))) {
                dispatch(getUserById(Number(userId)));
            }
        }
    }, [user, dispatch, userId]);

    React.useEffect(() => {
        if (cart === undefined && userId) {
            dispatch(getUserCarts({ userId }));
        }
    }, [userId, cart]);

    const handlePaymentAndOrder = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsProcessing(true);
        // check if stripe and elements are loaded
        if (!stripe || !elements) {
            setIsProcessing(false);
            toast.error("Stripe has not loaded yet. Please try again.");
            return;
        }

        // create payment intent with card details by backend
        const cardElement = elements.getElement(CardElement);
        try {
            const intent = { amount: cart?.totalAmount, currency: "EUR" };
            const responce = await api.post("/orders/create-payment-intent", intent);
            const clientSecret = responce.data.data.clientSecret;

            let addr = _.find(user?.addresses, addr => addr.addressType === "SHIPPING");
            if (addr === undefined) {
                addr = (user?.addresses !== undefined && user.addresses.length > 0) ? user.addresses[0] : undefined;
                if (addr === undefined) {
                    setIsProcessing(false);
                    toast.error("No address found for user. Please add an address before checkout.");
                    return;
                }
            }
            const address: PaymentMethodCreateParams.BillingDetails.Address = {
                line1: addr.optionalName,
                line2: addr.street,
                city: addr.city,
                country: addr.country,
            }

            // confirm payment intent with card details
            const paymentResult: PaymentIntentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement!,
                    billing_details: {
                        name: user?.firstName + " " + user?.lastName,
                        email: user?.email,
                        address,
                    },
                },
            });
            console.log('paymentResult', paymentResult);
            
            // place order if payment successful, else show error message
            if (paymentResult.paymentIntent?.status === "succeeded") {
                dispatch(placeOrder(Number(userId))).unwrap().then(() => {
                    dispatch(resetCart());
                }).catch((error) => {
                    toast.error("Failed to place order: " + error.message);
                });
                toast.success("Payment successful! Your order has been placed.");
            }
            else {
                toast.error("Payment failed: " + paymentResult.error?.message);
            }

        }
        catch (err: any) {
            setIsProcessing(false);
            toast.error("Payment failed: " + err.message);
            return;
        }
        setIsProcessing(false);
    };

    return (
        <div>
            <h1>Checkout Page</h1>
        </div>
    );
};

export default Checkout;