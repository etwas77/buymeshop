import { useDispatch, useSelector } from "react-redux";
import { userLogin, LoginState } from "../../store/features/loginSlice";
import { AppDispatch } from "../../store/store";
import React from "react";
import { useNavigate } from "react-router-dom";



const Login = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = React.useState<string>("bo.barker@nowhere.com");
    const [password, setPassword] = React.useState<string>("456");
    const navigate = useNavigate();

    const { accessToken } = useSelector((state: { login: LoginState }) => state.login);

    React.useEffect(() => {
        if (accessToken !== undefined) {
            navigate("/products");
        }
    }, [accessToken, navigate]);

    return (
        <div className="justify-content-center p-5">
            <h1>Login Page</h1>
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
            <button className="btn btn-primary" onClick={() => dispatch(userLogin({ email, password }))}>Login</button>
        </div>
    );
};

export default Login;