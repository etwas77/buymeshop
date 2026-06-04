import { StripeCardElementOptions } from "@stripe/stripe-js";

export const cardElementOptions: StripeCardElementOptions = {
    style: {
        base: {
            color: "#0d0de2",
            fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
            fontSmoothing: "antialiased",
            fontSize: "16px",
            "::placeholder": {
                color: "#aab7c4",
            },
        },
        invalid: {
            color: "red",
            iconColor: "red",
        },
    },
    hidePostalCode: true,
};