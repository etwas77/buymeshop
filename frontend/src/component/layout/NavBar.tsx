import { Container, Nav, Navbar, NavDropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiLogOut } from "react-icons/bi";
import { FaReceipt, FaShoppingCart, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AuthState, logout } from "../../store/features/authSlice";
import { cartState } from "../../store/features/cartSlice";
import { OrderState } from "../../store/features/orderSlice";
import { AppDispatch } from "../../store/store";

const NavBar = () => {

    const { items } = useSelector((state: { cart: cartState }) => state.cart);
    const { orders } = useSelector((state: { order: OrderState }) => state.order);
    const { isAuthenticated } = useSelector((state: { auth: AuthState }) => state.auth);

    const dispatch = useDispatch<AppDispatch>();

    const userId = localStorage.getItem("userId");
    const authToken = localStorage.getItem("authToken") ?? undefined;

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

                    {!isAuthenticated &&
                        <Nav className='me-auto'>
                            <Nav.Link to={"/login"} as={Link}>
                                Log-in
                            </Nav.Link>
                        </Nav>
                    }
                    <Nav className='ms-auto'>
                        <NavDropdown title='Account'>
                            <>
                                <NavDropdown.Item to={"/account"} as={Link}>
                                    <FaUser />
                                    My Account
                                </NavDropdown.Item>

                                <NavDropdown.Divider />
                                <NavDropdown.Item to={`/cart/${userId}`} as={Link}>
                                    <FaShoppingCart />
                                    My Cart({items.length})
                                </NavDropdown.Item>

                                <NavDropdown.Item to={`/orders/${userId}`} as={Link}>
                                    <FaReceipt />
                                    My Orders({orders.length})
                                </NavDropdown.Item>

                                <NavDropdown.Divider />

                                {isAuthenticated &&
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
                        <Nav.Link to={`/cart/${userId}`} as={Link}>

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