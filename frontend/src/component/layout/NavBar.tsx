import React from "react";
import { Container, Nav, Navbar, NavDropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import { BiLogOut } from "react-icons/bi";
import { FaReceipt, FaShoppingCart, FaUser } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { cartState, getUserCarts } from "../../store/features/cartSlice";
import { LoginState, setAccessToken } from "../../store/features/loginSlice";
import { getOrdersByUserId, OrderState } from "../../store/features/orderSlice";
import { getUserById } from "../../store/features/userSlice";
import { AppDispatch } from "../../store/store";
import { isValidToken } from "../common/utils/Functions";

const NavBar = () => {
    const { accessToken } = useSelector((state: { login: LoginState }) => state.login);
    const { items } = useSelector((state: { cart: cartState }) => state.cart);
    const { orders } = useSelector((state: { order: OrderState }) => state.order);

    const dispatch = useDispatch<AppDispatch>();

    const userId = accessToken ? JSON.parse(atob(accessToken.split('.')[1])).id : null;

    React.useEffect(() => {
        if (accessToken === undefined) {
            const accessToken = localStorage.getItem("accessToken");
            if (accessToken)
                dispatch(setAccessToken(accessToken));
        }
        else {
            const valid = isValidToken(accessToken);
            if (!valid) {
                localStorage.removeItem("accessToken");
            }
            else {
                dispatch(getUserCarts({ userId }));
                dispatch(getOrdersByUserId(Number(userId)));
                dispatch(getUserById(userId));
            }

        }
    }, [accessToken, dispatch]);

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

                    {accessToken === undefined &&
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

                                {accessToken !== undefined &&
                                    <NavDropdown.Item onClick={() => {
                                        localStorage.removeItem("accessToken");
                                        dispatch(setAccessToken(undefined));
                                        setAccessToken(undefined);
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