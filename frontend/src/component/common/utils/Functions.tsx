import { useSelector } from "react-redux";
import { AuthState } from "../../../store/features/authSlice";

export const isValidToken = (token: string) => {
    if (!token) {
        console.log("no token available");
        return false;
    }
    try {
        const [, payload] = token.split('.');
        const decoded = JSON.parse(atob(payload));
        if (!decoded.exp) {
            console.log("token is corrupted");
            return false;
        }

        // exp is in seconds, Date.now() is in ms
        const isExpired = decoded.exp * 1000 > Date.now();
        if (!isExpired)
            console.log('token is expired');

        return isExpired;
    } catch {
        console.log("token is invalid");
        return false;
    }
}

export const isAdmin = () => {
    const { token, isAuthenticated, roles } = useSelector((state: { auth: AuthState }) => state.auth);
    if(isAuthenticated && token) {
        return roles.some(role => role.toLowerCase() === "admin");
    }
    return false;
}