import { Spinner } from "react-bootstrap";

export interface LoadSpinnerProps {
    variant: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "light" | "dark";
};

const LoadSpinner = (p: LoadSpinnerProps) => {
    const { variant } = p;
    return (
        <div className="d-flex align-items-center justify-content-center mt-5 mb-5"
            style={{ height: "100%" }}>
            <Spinner animation="border" variant={variant} />
        </div>
    );
};

export default LoadSpinner;