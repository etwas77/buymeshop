import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";
import { ToastContainer } from "react-toastify";

const RootLayot = () => {
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