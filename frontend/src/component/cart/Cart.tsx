import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom"; import { AppDispatch } from "../../store/store";
import { cartState, getUserCarts } from "../../store/features/cartSlice";
import React from "react";
import _ from "lodash";
import { CartItemDto } from "../../dtos/CartItemDto";
import { BsDash, BsPlus, BsTrash } from "react-icons/bs";
import { Card } from "react-bootstrap";
import ProductImage from "../common/utils/ProductImage";

const Cart = () => {
    const { userId } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const { items } = useSelector((state: { cart: cartState }) => state.cart);

    React.useEffect(() => {
        if (userId) {
            dispatch(getUserCarts({ userId }));
        }
    }, [userId, dispatch]);

    // React.useEffect(() => {
    //     if (items.length !== 0) {
    //         console.log('cart items', items);

    //     }
    // }, [items]);

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
                    const imageId: string | undefined = item.images.length === 0 ? undefined : item.images[0].id;
                    console.log('imageId', imageId);
                    
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
                                <div className="text-center">{item.quantity}</div>
                                <div className="text-center">{(item.unitPrice * item.quantity).toFixed(2)}</div>
                                <div className="text-center">
                                    <button className="btn btn-sm btn-outline-secondary me-2">
                                        <BsDash />
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary me-2">
                                        <BsPlus />
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger">
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
                        <Link to={"#"} className="btn btn-outline-secondary me-2">
                            Continue shopping
                        </Link>
                        <Link to={"#"} className="btn btn-primary">
                            Proceed to checkout
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;