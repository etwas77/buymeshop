import _ from "lodash";
import React from "react";
import { BsPlus, BsSave, BsTrash } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AddressDto, AddressType } from "../../dtos/AddressDto";
import { createAddresses, deleteAddress, getUserById, updateAddress, UserState } from "../../store/features/userSlice";
import { AppDispatch } from "../../store/store";

const Account = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: { user: UserState }) => state.user);
    const [addresses, setAddresses] = React.useState<AddressDto[]>([]);
    const navigate = useNavigate();

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

    const handleAddressChange = (index: number, field: keyof AddressDto, value: string) => {
        setAddresses((prev) =>
            prev.map((address, i) => {
                if (i !== index) {
                    return address;
                }
                if (field === "addressType") {
                    return { ...address, addressType: value as AddressType };
                }
                return { ...address, [field]: value };
            })
        );
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
        setAddresses((prev) => [...prev, newAddress]);
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
                <div>
                    {_.map(addresses, (address, index) => (
                        <form key={index} className="mb-3 p-3 border rounded" onSubmit={(event) => handleAddressSubmit(event, index)}>
                            <table className="table table-borderless mb-0">
                                <tbody>
                                    <tr>
                                        <td style={{ width: "180px" }}><label className="mb-0">Street:</label></td>
                                        <td>
                                            <input
                                                className="form-control"
                                                type="text"
                                                value={address.street ?? ""}
                                                onChange={(event) => handleAddressChange(index, "street", event.target.value)}
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
                                                onChange={(event) => handleAddressChange(index, "city", event.target.value)}
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
                                                onChange={(event) => handleAddressChange(index, "country", event.target.value)}
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
                                                onChange={(event) => handleAddressChange(index, "phone", event.target.value)}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><label className="mb-0">Address Type:</label></td>
                                        <td>
                                            <select
                                                className="form-control mb-1"
                                                value={address.addressType}
                                                onChange={(event) => handleAddressChange(index, "addressType", event.target.value)}
                                            >
                                                {_.map(Object.values(AddressType), (type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td />
                                        <td>
                                            <button className="btn btn-primary" type="submit" >
                                                <BsSave /> {address.id ? "" : "Create"}
                                            </button>
                                            <button className="btn btn-danger" type="button" disabled={!address.id} onClick={() => handleDeleteAddress(address.id)}>
                                                <BsTrash />
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </form>
                    ))}
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