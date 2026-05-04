import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LoginState, setAccessToken } from "../../store/features/loginSlice";
import { useDispatch, useSelector } from "react-redux";

const NavBar = () => {
    const { accessToken } = useSelector((state: { login: LoginState }) => state.login);
    const dispatch = useDispatch();

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
                                    <NavDropdown.Item onClick={() => dispatch(setAccessToken(undefined))}>
                                        Log-out
                                    </NavDropdown.Item>
                                }
                                {accessToken === undefined &&
                                    <NavDropdown.Item to={"/login"} as={Link}>
                                        Log-in
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