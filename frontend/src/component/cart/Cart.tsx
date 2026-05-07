import _ from "lodash";
import React from "react";
import { Card } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CartItemDto } from "../../dtos/CartItemDto";
import { cartState, getUserCarts, removeCartItem, setLoading, updateCartItemQuantity } from "../../store/features/cartSlice";
import { AppDispatch } from "../../store/store";
import ProductImage from "../common/utils/ProductImage";
import QuantityUpdater from "../common/utils/QuantityUpdater";
import LoadSpinner from "../common/LoadSpinner";
import { placeOrder } from "../../store/features/orderSlice";

const Cart = () => {
    const { userId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { items, cartId, isLoading } = useSelector((state: { cart: cartState }) => state.cart);
    const navigate = useNavigate();

    React.useEffect(() => {        
        if (userId !== undefined && userId !== "null") {            
            dispatch(getUserCarts({ userId }));
        }
        else {
            dispatch(setLoading(false)); // No user ID, so we can stop loading immediately
        }
    }, [userId, dispatch]);



    const handleQuantityChange = React.useCallback((productId: number, quantity: number) => () => {
        if (quantity >= 1) {
            dispatch(updateCartItemQuantity({ cartId, productId, quantity }));
        }
    }, [dispatch, cartId]);

    const handlePlaceOrder = () => {
        if(items.length > 0) {
            dispatch(placeOrder(Number(userId)));
            navigate("/orders/" + userId);
        }
    };

    if (isLoading) {
        return <LoadSpinner variant="secondary" />;
    }

    return (
        <div className="container mt-5 mb-5 p-5">
            <div className="d-flex flex-column">
                <div className="d-flex justify-content-between mb-4 fw-bold">
                    <div className="text-center">image</div>
                    <div className="text-center">name</div>
                    <div className="text-center">brand</div>
                    <div className="text-center">price</div>
                    <div className="text-center">quantity</div>
                    <div className="text-center">total</div>
                    <div className="text-center">actions</div>
                </div>

                {_.map(items, (item: CartItemDto, idx) => {
                    const productId = item.productId;
                    const quantity = item.quantity;

                    const imageId: string | undefined = item.images.length === 0 ? undefined : item.images[0].id;
                    return (
                        <Card key={idx} className="mb-4">
                            <Card.Body className="d-flex justify-content-between align-items-center shadow">
                                <div className="d-flex align-items-center">
                                    <Link to={"#"}>
                                        <div className="cart-image-container-all100" >
                                            {imageId &&
                                                <ProductImage imageId={imageId} />
                                            }
                                        </div>
                                    </Link>
                                </div>

                                <div className="text-center">{item.productName}</div>
                                <div className="text-center">{item.productBrand}</div>
                                <div className="text-center">{item.unitPrice.toFixed(2)}</div>
                                <div className="text-center">
                                    <QuantityUpdater
                                        quantity={quantity}
                                        increment={handleQuantityChange(productId, quantity + 1)}
                                        decrement={handleQuantityChange(productId, quantity - 1)}
                                    />
                                </div>
                                <div className="text-center">{(item.unitPrice * item.quantity).toFixed(2)}</div>
                                <div className="text-center">
                                    <button className="btn btn-sm btn-outline-danger"
                                        onClick={() => dispatch(removeCartItem({ cartId, productId }))}
                                    >
                                        <BsTrash />
                                    </button>
                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}


                <div className=" cart-footer d-flex align-items-center mt-4">
                    <h4 className="mb-0 cart-title">
                        Total cart amount: {_.sumBy(items, item => item.unitPrice * item.quantity).toFixed(2)}
                    </h4>
                    <div className="ms-auto checkout-links">
                        <Link to={"#"} className="btn btn-outline-secondary me-2" onClick={() => navigate("/")} >
                            Continue shopping
                        </Link>
                        <Link to={"#"} className="btn btn-primary" onClick={handlePlaceOrder} >
                            Place order
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;