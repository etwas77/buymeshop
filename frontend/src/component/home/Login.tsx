import React from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store/store";
import { setAccessToken } from "../../store/features/loginSlice";

const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = React.useState<string>("bo.barker@nowhere.com");
    const [password, setPassword] = React.useState<string>("456");
    const navigate = useNavigate();

    const userLogin = async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        if (response.data && response.data.accessToken) {
            localStorage.setItem("accessToken", response.data.accessToken);
            dispatch(setAccessToken(response.data.accessToken));
            navigate("/");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <div className="p-5" style={{ minWidth: "350px" }}>
                <h1 className="text-center">Login Page</h1>
                <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control mb-3"
                    style={{ maxWidth: "300px" }}
                />
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control mb-3"
                    style={{ maxWidth: "300px" }}
                />
                <div className="text-center">
                    <button className="btn btn-primary" onClick={() => userLogin(email, password)}>Login</button>
                </div>
            </div>
        </div>
    );
};

export default Login;