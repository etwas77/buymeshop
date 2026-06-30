

export const clearAuthAndRedirect = () => {
    console.log('clear auth and redirect called');  
    window.location.href = "/login";
};