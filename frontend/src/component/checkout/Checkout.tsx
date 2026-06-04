import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StripeCardElementChangeEvent } from "@stripe/stripe-js";
import { PaymentMethodCreateParams } from "@stripe/stripe-js/dist/api/payment-methods";
import { PaymentIntentResult } from "@stripe/stripe-js/dist/stripe-js/stripe";
import _ from "lodash";
import React, { ChangeEvent } from "react";
import { Card, Col, Container, Form, FormGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AddressDto } from "../../dtos/AddressDto";
import { cartState, getUserCarts, resetCart } from "../../store/features/cartSlice";
import { createPaymentIntent, placeOrder } from "../../store/features/orderSlice";
import { getUserById, UserState } from "../../store/features/userSlice";
import { AppDispatch } from "../../store/store";
import { cardElementOptions } from "./CardElementOptions";

interface UserInfo {
    firstName?: string;
    lastName?: string;
    email?: string;
}

const Checkout = () => {
    const { userId } = useParams();
    const { user } = useSelector((state: { user: UserState }) => state.user);
    const { cart } = useSelector((state: { cart: cartState }) => state.cart);
    const dispatch = useDispatch<AppDispatch>();

    const [userInfo, setUserInfo] = React.useState<UserInfo>({
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
    });
    const [selectedAddress, setSelectedAddress] = React.useState<AddressDto>();

    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);
    const [cardError, setCardError] = React.useState<string>();

    React.useEffect(() => {
        if (user === undefined) {
            if (userId && !isNaN(Number(userId))) {
                dispatch(getUserById(Number(userId)));
            }
        }
        if (user) {
            setUserInfo({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            });
            if (user.addresses && user.addresses.length > 0) {
                setSelectedAddress(user.addresses[0]);
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
        if (cart === undefined) {
            setIsProcessing(false);
            toast.error("Cart is empty. Please add items to your cart before checkout.");
            return;
        }

        // create payment intent with card details by backend
        const cardElement: any = elements.getElement(CardElement);
        try {
            const intent = { amount: cart.totalAmount, currency: "EUR" };
            const clientSecret = await dispatch(createPaymentIntent(intent)).unwrap();

            if (selectedAddress === undefined) {
                setIsProcessing(false);
                toast.error("Please select a billing address.");
                return;
            }
            const address: PaymentMethodCreateParams.BillingDetails.Address = {
                line1: selectedAddress.optionalName,
                line2: selectedAddress.street,
                city: selectedAddress.city,
                country: selectedAddress.country,
            }

            // confirm payment intent with card details
            const paymentResult: PaymentIntentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement!,
                    billing_details: {
                        name: userInfo.firstName + " " + userInfo.lastName,
                        email: userInfo.email,
                        address,
                    },
                },
            });
            //console.log('paymentResult.paymentIntent', paymentResult);

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
            console.log('err', err);

            toast.error("Error processing payment");
            return;
        }
        setIsProcessing(false);
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target;
        setUserInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const normalizeString = (str: string | undefined): string => {
        return str ? str.trim().toLowerCase() : "";
    };

    const handleAddressChange = (event: ChangeEvent<HTMLSelectElement>): void => {
        const selectedId: string = normalizeString(event.target.value);
        const address = user?.addresses?.find((a) => normalizeString(String(a.id ?? "undefined")) === selectedId);
        setSelectedAddress(address);
    };

    const handleStripeError = (event: StripeCardElementChangeEvent) => {
        if (event.error) {
            setCardError(event.error ? event.error.message : "");
        }
        else {
            setCardError("");
        }
    };


    return (
        <Container className="mt-5 mb-5">
            <h1 className="text-center">Checkout Page</h1>
            <div className="d-flex justify-content-center">
                <Row>
                    <Col md={8}>
                        <Form
                            className="p-4 border rounded shadow"
                        >
                            <Row>
                                <Col md={6}>
                                    <FormGroup>
                                        <label htmlFor="firstName" className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="firstName"
                                            className="form-control mb-2"
                                            value={userInfo.firstName || ""}
                                            onChange={handleInputChange}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <label htmlFor="lastName" className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            className="form-control mb-2"
                                            value={userInfo.lastName || ""}
                                            onChange={handleInputChange}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                            <FormGroup>
                                <label htmlFor="email" className="form-label">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control mb-2"
                                    value={userInfo.email || ""}
                                    onChange={handleInputChange}
                                />
                            </FormGroup>
                            <div>
                                <h4>select billing address</h4>
                                <Form.Select
                                    aria-label="Select billing address"
                                    value={selectedAddress?.id || ""}
                                    onChange={handleAddressChange}
                                    className="mb-3"
                                >
                                    {(user?.addresses || []).length === 0 && (
                                        <option value="">No address available</option>
                                    )}

                                    {_.map(user?.addresses, address => {
                                        const label = `${address.addressType} - ${address?.optionalName ? address.optionalName + "," : userInfo.firstName + " " + userInfo.lastName} 
                                                        ${address.street}, ${address.city}, ${address.country}`.trim();
                                        return (
                                            <option key={address.id} value={address.id}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </Form.Select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="card-element" className="form-label">
                                    <h4>credit or debit card</h4>
                                </label>
                                <div id="card-element" className="form-control">
                                    <CardElement 
                                        options={cardElementOptions}
                                        onChange={handleStripeError}
                                    />
                                    {cardError && <div className="text-danger mt-2">{cardError}</div>}
                                </div>
                            </div>
                        </Form>
                    </Col>
                    <Col md={4}>
                        <h6 className="mt-4 text-center cart-title">Summary</h6>
                        <hr />
                        <Card style={{ backgroundColor: "#f8f9fa", padding: "20px" }}>
                            <Card.Body>
                                <Card.Title className="mb-2 text-muted text-success">
                                    Total amount: {cart?.totalAmount.toFixed(2) || "undefined"}
                                </Card.Title>
                            </Card.Body>
                            <button
                                className="btn btn-warning mt-3"
                                type="submit"
                                disabled={!stripe || isProcessing}
                                onClick={handlePaymentAndOrder}
                            >
                                {isProcessing ? "Processing..." : "Pay Now"}
                            </button>
                        </Card>
                    </Col>  
                </Row>
            </div>
        </Container>
    );
};

export default Checkout;