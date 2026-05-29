import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthState } from "../../store/features/authSlice";

export interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowRoles?: string[];
    useOutlet?: boolean;
};

const ProtectedRoute = (p: ProtectedRouteProps) => {
    const { children, allowRoles = [], useOutlet = false } = p;
    const { isAuthenticated, roles } = useSelector((state: { auth: AuthState }) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRolesLower = roles.map(r => r.toLowerCase());
    const allowRolesLower = allowRoles.map(r => r.toLowerCase());
    const hasRequiredRole = allowRolesLower.length === 0 || allowRolesLower.some(role => userRolesLower.includes(role));

    if (!hasRequiredRole) {
        return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return useOutlet ? <Outlet /> : children;
};

export default ProtectedRoute;