import React from "react";
import { Container, Nav, Navbar, NavDropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiLogOut } from "react-icons/bi";
import { FaCheck, FaReceipt, FaShoppingCart, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AuthState, logout } from "../../store/features/authSlice";
import { cartState, getCartsMe } from "../../store/features/cartSlice";
import { getOrdersByMe, OrderState } from "../../store/features/orderSlice";
import { AppDispatch } from "../../store/store";

const NavBar = () => {
    const { items } = useSelector((state: { cart: cartState }) => state.cart);
    const { orders } = useSelector((state: { order: OrderState }) => state.order);
    const { authMe } = useSelector((state: { auth: AuthState }) => state.auth);
    const isAdminUser = authMe?.roles?.some(role => role.name === "admin") ?? false;
    
    const dispatch = useDispatch<AppDispatch>();

    React.useEffect(() => {
        if (authMe) {
            dispatch(getCartsMe());
            dispatch(getOrdersByMe());
        }
    }, [authMe, dispatch]);


    return (
        <Navbar expand='lg' sticky='top' className='nav-bg'>
            <Container>
                <Navbar.Brand to={"/"} as={Link}>
                    <span className="shop-home">BuyMeShop-le</span>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                    <Nav className='me-auto'>
                        <Nav.Link to={"/products"} as={Link}>
                            All Products
                        </Nav.Link>
                    </Nav>
                    <Nav className='me-auto'>
                        <Nav.Link to={"/manage"} as={Link}>
                            Manage Products
                        </Nav.Link>
                    </Nav>

                    {isAdminUser &&
                        <Nav className='me-auto'>
                            <Nav.Link to={"/admin"} as={Link}>
                                Admin Panel
                            </Nav.Link>
                        </Nav>
                    }

                    {!authMe &&
                        <Nav className='me-auto'>
                            <Nav.Link to={"/login"} as={Link}>
                                Log-in
                            </Nav.Link>
                        </Nav>
                    }
                    <Nav className='ms-auto'>
                        <NavDropdown title='Account' id='profile-dropdown' align="end">
                            <>
                                <NavDropdown.Item to={"/profile"} as={Link}>
                                    <FaUser />
                                    Profile
                                </NavDropdown.Item>

                                <NavDropdown.Divider />
                                <NavDropdown.Item to={"/cart"} as={Link}>
                                    <FaShoppingCart />
                                    My Cart({items.length})
                                </NavDropdown.Item>

                                <NavDropdown.Item to={`/orders`} as={Link}>
                                    <FaReceipt />
                                    My Orders({orders.length})
                                </NavDropdown.Item>

                                <NavDropdown.Item to={`/checkout`} as={Link}>
                                    <FaCheck />
                                    Checkout
                                </NavDropdown.Item>

                                <NavDropdown.Divider />

                                {authMe &&
                                    <NavDropdown.Item onClick={() => {
                                        dispatch(logout());
                                    }}>
                                        <BiLogOut />
                                        Log-out
                                    </NavDropdown.Item>
                                }
                            </>
                        </NavDropdown>
                    </Nav>
                    <OverlayTrigger
                        placement="bottom"
                        overlay={<Tooltip id="cart-tooltip">View Cart</Tooltip>}
                    >
                        <Nav.Link to={`/cart`} as={Link}>

                            <FaShoppingCart />

                            ({items.length})

                        </Nav.Link>
                    </OverlayTrigger>
                </Navbar.Collapse>
            </Container>
        </Navbar >
    );
};

export default NavBar;