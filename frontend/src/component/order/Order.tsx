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
                <table className="table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th className="text-center">Date</th>
                            <th className="text-center">Status</th>
                            <th className="text-center">Amount</th>
                            <th className="text-center">Items</th>
                        </tr>
                    </thead>
                    <tbody>

                        {_.map(orders, (order: OrderDto, idx) => {
                            return (
                                <tr key={idx} >
                                    <td className="text-center">{order.id}</td>
                                    <td className="text-center">{order.orderDate}</td>
                                    <td className="text-center">{order.status}</td>
                                    <td className="text-center">{order.totalAmount.toFixed(2)}</td>
                                    <td className="text-center">
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
                                                {_.map(order.orderItems, (item: OrderItemDto, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "order-row-even" : "order-row-odd"} >
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


                                    </td>
                                </tr>
                            );
                        })}

                    </tbody>
                </table>
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
