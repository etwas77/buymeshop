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
            .map((role) =>  role.name)
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
        if(selectedUser) {
            dispatch(updateUser(selectedUser));
        }
    }

    return (
        <div>
            <h1 className="text-center mt-5">Admin Panel</h1>
            <ToastContainer />
            <div>
                <button className="btn btn-sm btn-primary ms-3" onClick={() => dispatch(getUsers())}>get users</button>

                <div className="ms-3 mt-3">
                    <select className="form-select" defaultValue="" onChange={onSelect}>
                        <option value="">Select user by email</option>
                        {users?.map((user: UserDto) => (
                            <option key={user.id} value={user.id}>
                                {user.firstName} {user.lastName}, {user.email}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            {selectedUser && (
                <div>
                    <h2>Edit User Details</h2>
                    <p>First Name: {selectedUser.firstName}</p>
                    <p>Last Name: {selectedUser.lastName}</p>
                    <p>Email: {selectedUser.email}</p>
                    <p>Roles:
                        <input type="text" className="form-control" value={rolesInput} onChange={onRolesChange} />
                    </p>
                </div>
            )}
            <button className="btn btn-sm btn-success ms-3" onClick={onClickUpdateUser}>update user</button>
        </div>
    );
};

export default AdminPanel;