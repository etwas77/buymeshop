import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import { ToastContainer } from "react-toastify";
import { AppDispatch } from "../../store/store";
import { useDispatch } from "react-redux";
import { callAuthMe } from "../../store/features/authSlice";
import React from "react";

const RootLayot = () => {
    const dispatch = useDispatch<AppDispatch>();
    
    React.useEffect(() => {
        dispatch(callAuthMe());
    }, [dispatch]);

    return (
        <main>
            <NavBar />
            <ToastContainer position="top-right" autoClose={3000} />
            <div>
                <Outlet />
            </div>
            <Footer />
        </main>
    );
};

export default RootLayot;