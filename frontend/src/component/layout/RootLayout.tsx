import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";
import { isValidToken } from "../common/utils/Functions";
import React from "react";
import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { logout } from "../../store/features/authSlice";



const RootLayot = () => {
    const authToken = localStorage.getItem("authToken");
    const dispatch = useDispatch<AppDispatch>();
    
    React.useEffect(() => {
        if (authToken && !isValidToken(authToken)) {
            dispatch(logout());
        }
    }, [authToken, dispatch]);
    
    return (
        <main>
            <NavBar />
            <div>
                <Outlet />
            </div>
            <Footer />
        </main>
    );
};

export default RootLayot;