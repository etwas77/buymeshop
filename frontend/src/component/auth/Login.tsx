import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthState, login } from "../../store/features/authSlice";
import { AppDispatch } from "../../store/store";

export interface LoginCredentials {
    email: string;
    password: string;
}

const Login = () => {
    const { token, isAuthenticated, roles } = useSelector((state: { auth: AuthState }) => state.auth);
    console.log('token', token);
    console.log('isAuthenticated', isAuthenticated);
    console.log('roles', roles);

    const [credentials, setCredentials] = React.useState<LoginCredentials>({ email: "", password: "" });
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (isAuthenticated) {
            const from = (location.state as any)?.from?.pathname || "/";
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, location.state]);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <div className="p-5" style={{ minWidth: "350px" }}>
                <h1 className="text-center">Login Page</h1>
                <input
                    type="text"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="form-control mb-3"
                    style={{ maxWidth: "300px" }}
                />
                <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="form-control mb-3"
                    style={{ maxWidth: "300px" }}
                />
                <div className="text-center d-flex justify-content-center gap-3">
                    <button className="btn btn-primary" onClick={() => dispatch(login(credentials))}>Login</button>
                    <button className="btn btn-secondary" onClick={() => navigate("/register")}>Register</button>
                </div>
            </div>
        </div>
    );
};

export default Login;