import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { AppDispatch } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import { LoginState, setAccessToken } from "../../store/features/loginSlice";

const NavBar = () => {
    const { accessToken } = useSelector((state: { login: LoginState }) => state.login);
    const dispatch = useDispatch<AppDispatch>();

    const userId = accessToken ? JSON.parse(atob(accessToken.split('.')[1])).id : null;

    React.useEffect(() => {
        if (accessToken === undefined) {
            const accessToken = localStorage.getItem("accessToken");
            dispatch(setAccessToken(accessToken ?? undefined));
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
                        <Nav.Link to={"#"} as={Link}>
                            Manage Products
                        </Nav.Link>
                    </Nav>
                    <Nav className='me-auto'>
                        <Nav.Link to={`/cart/${userId}`} as={Link}>
                            My Cart
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
                                <NavDropdown.Item to={"#"} as={Link}>
                                    My Account
                                </NavDropdown.Item>

                                <NavDropdown.Divider />

                                <NavDropdown.Item to={"#"} as={Link}>
                                    My Orders
                                </NavDropdown.Item>

                                <NavDropdown.Divider />

                                {accessToken !== undefined &&
                                    <NavDropdown.Item onClick={() => {
                                        localStorage.removeItem("accessToken");
                                        dispatch(setAccessToken(undefined));
                                        setAccessToken(undefined);
                                    }}>
                                        Log-out
                                    </NavDropdown.Item>
                                }
                            </>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default NavBar;