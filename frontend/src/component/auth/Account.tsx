import _ from "lodash";
import React from "react";
import { BsPencilSquare, BsPlus, BsSave, BsTrash, BsX, BsXCircle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AddressDto, AddressType } from "../../dtos/AddressDto";
import { createAddresses, deleteAddress, getUserById, updateAddress, UserState } from "../../store/features/userSlice";
import { AppDispatch } from "../../store/store";
import { Card } from "react-bootstrap";

const Account = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: { user: UserState }) => state.user);
    const [addresses, setAddresses] = React.useState<AddressDto[]>([]);
    const [address, setAddress] = React.useState<AddressDto>();
    const navigate = useNavigate();
    console.log('address', address);

    React.useEffect(() => {
        const userId = localStorage.getItem("userId");
        if (userId === null) {
            navigate("/login");
            return;
        }

        if (!user || String(user.id) !== userId) {
            dispatch(getUserById(Number(userId)));
        }
    }, [dispatch, navigate, user]);

    React.useEffect(() => {
        setAddresses(user?.addresses ?? []);
    }, [user?.addresses]);

    const handleAddressChange = (field: keyof AddressDto, value: string) => {
        setAddress((prev) => {
            if (!prev) {
                return prev;
            }
            if (field === "addressType") {
                return { ...prev, addressType: value as AddressType };
            }   
            return { ...prev, [field]: value };
        });
    };

    const handleAddressSubmit = (event: React.FormEvent<HTMLFormElement>, index: number) => {
        event.preventDefault();
        const address = addresses[index];
        if (!address?.id) {
            address.userId = user?.id;
            dispatch(createAddresses({ addresses: [address] }));
            return;
        }
        dispatch(updateAddress({ addressId: address.id, address }));
    };

    const saveAddress = () => {
        if (address) {
            setAddresses((prev) => [...prev, address]);
            setAddress(undefined);
            if (!address?.id) {
                address.userId = user?.id;
                dispatch(createAddresses({ addresses: [address] }));
                return;
            }
            dispatch(updateAddress({ addressId: address.id, address }));
        }
    };

    const editAddress = (addressId?: string) => () => {
        if (!addressId) {
            return;
        }
        setAddress(addresses.find((a) => a.id === addressId));
    };

    const handleDeleteAddress = (id?: string): void => {
        if (!id) {
            return;
        }
        dispatch(deleteAddress({ addressId: id }));
    }

    const addAddress = () => {
        const newAddress: AddressDto = {
            street: "",
            city: "",
            country: "",
            phone: "",
            addressType: AddressType.HOME,
        };
        setAddress(newAddress);
    }

    return (
        <div className="container mt-4" style={{ maxWidth: "700px" }} >
            <h1>Account Page</h1>
            <section>
                <h2>Login</h2>

                <table className="table table-borderless mb-0" >
                    <tbody>
                        <tr>
                            <td style={{ width: "180px" }}><label className="mb-0">First Name:</label></td>
                            <td><input className="form-control" type="text" value={user?.firstName ?? ""} readOnly /></td>
                        </tr>
                        <tr>
                            <td><label className="mb-0">Last Name:</label></td>
                            <td><input className="form-control" type="text" value={user?.lastName ?? ""} readOnly /></td>
                        </tr>
                        <tr>
                            <td><label className="mb-0">Email:</label></td>
                            <td><input className="form-control" type="email" value={user?.email ?? ""} readOnly /></td>
                        </tr>
                        <tr>
                            <td><label className="mb-0">Roles:</label></td>
                            <td><input className="form-control" type="text" value={user?.roles?.map((role: any) => role?.name ?? role).join(", ") ?? ""} readOnly /></td>
                        </tr>
                    </tbody>
                </table>

            </section>
            <section>
                <h2>Addresses</h2>
                <button className="btn btn-success mb-3" onClick={addAddress}>
                    <BsPlus />
                </button>
                {address &&
                    <Card className="mb-3 p-3 border rounded" style={{ width: "100%" }}>
                        <Card.Body>
                            <h4>EDIT: {user?.firstName} {user?.lastName}</h4>
                            <table className="table table-borderless mb-3">
                                <tbody>
                                    <tr>
                                        <td style={{ width: "180px" }}><label className="mb-0">Name (optional):</label></td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={address.optionalName ?? ""}
                                                onChange={(event) => handleAddressChange("optionalName", event.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style={{ width: "180px" }}><label className="mb-0">Street:</label></td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={address.street ?? ""}
                                                onChange={(event) => handleAddressChange("street", event.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="mb-0">City:</label></td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={address.city ?? ""}
                                                onChange={(event) => handleAddressChange("city", event.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="mb-0">Country:</label></td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={address.country ?? ""}
                                                onChange={(event) => handleAddressChange("country", event.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="mb-0">Phone:</label></td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={address.phone ?? ""}
                                                onChange={(event) => handleAddressChange("phone", event.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="mb-0">Address Type:</label></td>
                                        <td>
                                            <select
                                                className="form-control mb-1"
                                                value={address.addressType}
                                                onChange={(event) => handleAddressChange("addressType", event.target.value)}
                                            >
                                                {_.map(Object.values(AddressType), (type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <button className="btn btn-secondary me-2" type="button" onClick={saveAddress}>
                                <BsSave />
                            </button>
                            <button className="btn btn-secondary" type="button" onClick={() => { setAddress(undefined) }}>
                                <BsXCircle />
                            </button>
                        </Card.Body>
                    </Card>
                }
                <div className="d-flex flex-wrap justify-content-center p-5">
                    {_.map(addresses, (address, index) => {
                        return <Card key={index} className="mb-3 p-3 border rounded" style={{ width: "100%" }}>
                            <Card.Body>
                                <h4>{user?.firstName} {user?.lastName}</h4>
                                {address.optionalName && <p>Optional name: {address.optionalName}</p>}
                                <p> {address.street}, {address.city}, {address.country}</p>
                                <p> {address.phone}</p>
                                <p><strong>Type:</strong> {address.addressType}</p>
                                <button className="btn btn-primary me-2" type="button" disabled={!address.id} onClick={editAddress(address.id)}>
                                    <BsPencilSquare />
                                </button>
                                <button className="btn btn-danger" type="button" disabled={!address.id} onClick={() => handleDeleteAddress(address.id)}>
                                    <BsTrash />
                                </button>
                            </Card.Body>
                        </Card>;
                    })}
                </div>
            </section>
            <section>
                <h2>Orders</h2>
                <div>
                    {_.map(user?.orders, (order, index) => (
                        <form key={index} className="mb-3 p-3 border rounded">
                            <table className="table table-borderless mb-0">
                                <tbody>
                                    <tr>
                                        <td style={{ width: "180px" }}><label className="mb-0">Order ID:</label></td>
                                        <td><input className="form-control" type="text" value={order.id ?? ""} readOnly placeholder="Enter order ID" /></td>
                                    </tr>
                                    <tr>
                                        <td><label className="mb-0">Status:</label></td>
                                        <td><input className="form-control" type="text" value={order.status ?? ""} readOnly placeholder="Enter order status" /></td>
                                    </tr>
                                </tbody>
                            </table>

                        </form>
                    ))}
                </div>
            </section>
            <section>
                <h2>Cart</h2>
                <div className="mb-3 p-3 border rounded">
                    <table className="table table-borderless mb-3">
                        <tbody>
                            <tr>
                                <td style={{ width: "180px" }}><strong>Cart ID:</strong></td>
                                <td>{user?.cart?.id}</td>
                            </tr>
                            <tr>
                                <td><strong>Total Amount:</strong></td>
                                <td>{user?.cart?.totalAmount}</td>
                            </tr>
                        </tbody>
                    </table>
                    <h5>Items:</h5>
                    <div>
                        {_.map(user?.cart?.items, (product, pIndex) => {
                            return (
                                <div key={pIndex} className="mb-3 p-3 border rounded">
                                    <table className="table table-borderless mb-0">
                                        <tbody>
                                            <tr>
                                                <td style={{ width: "180px" }}><strong>Product ID:</strong></td>
                                                <td>{product.id}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Product Name:</strong></td>
                                                <td>{product.productName}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Quantity:</strong></td>
                                                <td>{product.quantity}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Unit Price:</strong></td>
                                                <td>{product.unitPrice}</td>
                                            </tr>
                                            <tr>
                                                <td><strong>Total Price:</strong></td>
                                                <td>{product.totalPrice}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Account;