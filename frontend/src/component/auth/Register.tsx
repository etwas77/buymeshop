import _ from "lodash";
import React from "react";
import { BsPlus } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { AddressDto, AddressType } from "../../dtos/AddressDto";
import { CreateUserRequestDto } from "../../dtos/CreateUserRequestDto";
import { createUser, getUsers, UserState } from "../../store/features/userSlice";
import { AppDispatch } from "../../store/store";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { users, user } = useSelector((state: { user: UserState }) => state.user);
    const navigate = useNavigate();
    
    React.useEffect(() => {
        if(user) {
            navigate("/login");
        }
    }, [user]);

    React.useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const [req, setReq] = React.useState<CreateUserRequestDto>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        addresses: [],
    });
    const [error, setError] = React.useState("");

    const addAddress = () => {
        const newAddress: AddressDto = {
            street: "",
            city: "",
            country: "",
            phone: "",
            addressType: AddressType.HOME,
        };
        setReq((prevReq) => ({
            ...prevReq,
            addresses: [...prevReq.addresses, newAddress],
        }));
    };

    const handleInputChange = (field: "firstName" | "lastName" | "email" | "password") =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            setReq((prevReq) => ({
                ...prevReq,
                [field]: value,
            }));
        };

    const handleAddressChange = (index: number, field: "street" | "city" | "country" | "phone" | "addressType") =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { value } = e.target;
            setReq((prevReq) => ({
                ...prevReq,
                addresses: prevReq.addresses.map((address, addressIndex) => {
                    if (addressIndex !== index) {
                        return address;
                    }

                    if (field === "addressType") {
                        return {
                            ...address,
                            addressType: value as AddressType,
                        };
                    }

                    return {
                        ...address,
                        [field]: value,
                    };
                }),
            }));
        };

    const hasValidRequestData = (request: CreateUserRequestDto) => {
        const hasValidUserFields =
            request.firstName.trim().length > 0 &&
            request.lastName.trim().length > 0 &&
            request.email.trim().length > 0 &&
            request.password.trim().length > 0;

        const hasValidAddresses =
            request.addresses.length > 0 &&
            request.addresses.every((address) =>
                address.street.trim().length > 0 &&
                address.city.trim().length > 0 &&
                address.country.trim().length > 0 &&
                String(address.addressType).trim().length > 0,
            );

        return hasValidUserFields && hasValidAddresses;
    };

    const register = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!hasValidRequestData(req)) {
            setError("Please fill all fields before registering.");
            return;
        }

        setError("");
        dispatch(createUser(req));
    };

    return (
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <h1>Register Page</h1>
            <form onSubmit={register}>
                <input type="text" placeholder="First Name" className="form-control mb-3" style={{ maxWidth: "300px" }} value={req.firstName} onChange={handleInputChange("firstName")} />
                <input type="text" placeholder="Last Name" className="form-control mb-3" style={{ maxWidth: "300px" }} value={req.lastName} onChange={handleInputChange("lastName")} />
                <input type="email" placeholder="Email" className="form-control mb-3" style={{ maxWidth: "300px" }} value={req.email} onChange={handleInputChange("email")} />
                <input type="password" placeholder="Password" className="form-control mb-3" style={{ maxWidth: "300px" }} value={req.password} onChange={handleInputChange("password")} />
                <div>
                    <h5>address/es (need at least 1)</h5>
                    {_.map(req.addresses, (address, index) => (
                        <div key={index} className="mb-3">address {index + 1}
                            <input type="text" placeholder="Street" className="form-control mb-1" value={address.street} onChange={handleAddressChange(index, "street")} />
                            <input type="text" placeholder="City" className="form-control mb-1" value={address.city} onChange={handleAddressChange(index, "city")} />
                            <input type="text" placeholder="Country" className="form-control mb-1" value={address.country} onChange={handleAddressChange(index, "country")} />
                            <input type="text" placeholder="Phone" className="form-control mb-1" value={address.phone} onChange={handleAddressChange(index, "phone")} />
                            <select className="form-control mb-1" value={address.addressType} onChange={handleAddressChange(index, "addressType")}>
                                {_.map(Object.values(AddressType), (type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <button type="button" className="btn btn-secondary btn-sm mb-3" onClick={addAddress} ><BsPlus /></button>
                </div>
                {error && <p className="text-danger">{error}</p>}
                <button type="submit" className="btn btn-primary" >Register</button>
            </form>
        </div>
    );
};

export default Register;