import { useDispatch, useSelector } from "react-redux";
import { getUsers, updateUser, UserState } from "../../store/features/userSlice";
import React from "react";
import { AppDispatch } from "../../store/store";
import { UserDto } from "../../dtos/UserDto";
import { RoleDto } from "../../dtos/RoleDto";
import { ToastContainer } from "react-toastify";

const AdminPanel = () => {
    const { users } = useSelector((state: { user: UserState }) => state.user);
    const dispatch = useDispatch<AppDispatch>();
    const [selectedUser, setSelectedUser] = React.useState<UserDto>();
    const [rolesInput, setRolesInput] = React.useState("");
    const [filter, setFilter] = React.useState("");

    React.useEffect(() => {
        dispatch(getUsers());
    }, [dispatch]);


    const onSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const userId = e.target.value;
        const matchedUser = users?.find((user: UserDto) => String(user.id) === userId);
        setSelectedUser(matchedUser);
    };

    React.useEffect(() => {
        if (!selectedUser) {
            setRolesInput("");
            return;
        }

        const roleNames = (selectedUser.roles as RoleDto[])
            .map((role) => role.name)
            .join(", ");

        setRolesInput(roleNames);
    }, [selectedUser]);

    const onRolesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setRolesInput(value);

        setSelectedUser((prev) => {
            if (!prev) {
                return prev;
            }
            return {
                ...prev,
                roles: value
                    .split(",")
                    .map((role) => role.trim())
                    .map((name) => ({ name })),
            };
        });
    };

    const onClickUpdateUser = (): void => {
        if (selectedUser) {
            dispatch(updateUser(selectedUser));
        }
    }

    const normalizedFilter = filter.toLowerCase().trim();
    const filteredUsers = users?.filter((user: UserDto) => {
        const fullName = `${user.firstName ?? ""} ${user.lastName ?? ""}`.toLowerCase();
        const email = user.email?.toLowerCase() ?? "";

        return email.includes(normalizedFilter) || fullName.includes(normalizedFilter);
    });

    return (
        <div>
            <h1 className="text-center mt-5">Admin Panel</h1>
            <div className="mx-auto" style={{ maxWidth: "550px" }}>

                <ToastContainer />
                <div>
                    <div className="mt-3 mx-auto mb-3" style={{ maxWidth: "500px" }}>
                        <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Type email or name to filter users"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <select className="form-select" defaultValue="" onChange={onSelect} size={6}>
                            <option value="">Select user by email</option>
                            {filteredUsers?.map((user: UserDto) => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}, {user.email}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {selectedUser && (
                    <div className="mt-3 mx-auto" style={{ maxWidth: "500px" }}>
                        <h3>Edit User Details</h3>
                        <p>First Name: {selectedUser.firstName}</p>
                        <p>Last Name: {selectedUser.lastName}</p>
                        <p>Email: {selectedUser.email}</p>
                        <p>Roles:
                            <input type="text" className="form-control" value={rolesInput} onChange={onRolesChange} />
                        </p>
                        <button className="btn btn-sm btn-success d-block mx-auto mt-3 mb-3" onClick={onClickUpdateUser}>update user</button>
                    </div>
                )}
                
            </div>
        </div>
    );
};

export default AdminPanel;