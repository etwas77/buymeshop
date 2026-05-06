import _ from "lodash";
import React from "react";
import { Card } from "react-bootstrap";
import { FaCartShopping } from 'react-icons/fa6';
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OrderDto } from "../../dtos/OrderDto";
import { OrderItemDto } from "../../dtos/OrderItemDto";
import { getOrdersByUserId, OrderState } from "../../store/features/orderSlice";
import { AppDispatch } from "../../store/store";
import LoadSpinner from "../common/LoadSpinner";


const Order = () => {
    const { orders, isLoading } = useSelector((state: { order: OrderState }) => state.order);
    const dispatch = useDispatch<AppDispatch>();
    const { userId } = useParams();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (userId) {
            dispatch(getOrdersByUserId(Number(userId)));
        }
    }, [dispatch, userId]);

    if (isLoading)
        return <LoadSpinner variant="primary" />;

    return (
        <div className="container mt-5 mb-5 p-5">
            <div className="d-flex flex-column">
                <div className="d-flex justify-content-between mb-4 fw-bold">
                    <div className="text-center">Order ID</div>
                    <div className="text-center">Date</div>
                    <div className="text-center">Status</div>
                    <div className="text-center">Amount</div>
                    <div className="text-center">Items</div>
                </div>

                {_.map(orders, (order: OrderDto, idx) => {
                    return (
                        <Card key={idx} className="mb-4">
                            <Card.Body className="d-flex justify-content-between align-items-center shadow">

                                <div className="text-center">{order.id}</div>
                                <div className="text-center">{order.orderDate}</div>
                                <div className="text-center">{order.status}</div>
                                <div className="text-center">{order.totalAmount.toFixed(2)}</div>
                                <div className="text-center">

                                    <table className="table table-sm table-bordered mb-0">
                                        <thead>
                                            <tr>
                                                <th>Item ID</th>
                                                <th>Name</th>
                                                <th>Brand</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {_.map(order.orderItems, (item: OrderItemDto) => (
                                                <tr key={item.id}>
                                                    <td>{item.id}</td>
                                                    <td>{item.productName}</td>
                                                    <td>{item.productBrand}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{item.price.toFixed(2)}</td>
                                                    <td>{(item.quantity * item.price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                </div>
                            </Card.Body>
                        </Card>
                    );
                })}


                <div className=" cart-footer d-flex align-items-center mt-4">
                    <div className="ms-auto checkout-links">
                        <Link to={"#"} className="btn btn-outline-secondary me-2" onClick={() => navigate("/")} >
                            Continue shopping
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Order;
