import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import Footer from "./Footer";



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