import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import NavBar from "./NavBar";

const RootLayot = () => {
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