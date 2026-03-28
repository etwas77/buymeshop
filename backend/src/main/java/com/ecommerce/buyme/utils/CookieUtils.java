package com.ecommerce.buyme.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CookieUtils {

    @Value("${app.use-secure-cookie}")
    private boolean useSecureCookie;

    public void addRefreshTokenToCookie(String refreshToken, HttpServletResponse response, long maxAge) {
        if (response == null) {
            throw new IllegalArgumentException("HttpServletResponse cannot be null");
        }

        Cookie cookie = new Cookie("refreshToken", refreshToken);
        cookie.setHttpOnly(true);               // client-side scripts cannot access the cookie
        cookie.setSecure(this.useSecureCookie); // if true, cookie will only be sent over HTTPS
        cookie.setPath("/");
        cookie.setMaxAge((int) (maxAge / 1000));
        setResponseHeader(response, cookie, this.useSecureCookie ? "None" : "Lax"); // "Lax" prevents the cookie from being sent in cross-site requests, 
        // but allows it in top-level navigation. "None" allows the cookie to be sent in all contexts, but requires Secure to be true.
    }

    private void setResponseHeader(HttpServletResponse response, Cookie cookie, String sameSite) {
        StringBuffer header = new StringBuffer();
        header.append(cookie.getName()).append("=").append(cookie.getValue())
                .append("; HttpOnly; Path=").append(cookie.getPath())
                .append("; Max-Age=").append(cookie.getMaxAge())
                .append(this.useSecureCookie ? "; Secure" : "")
                .append("; SameSite=").append(sameSite);

        response.setHeader("Set-Cookie", header.toString());
    }

    public String getRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                log.info("Checking cookie: {}", cookie.getName());
                if ("refreshToken".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }

    public void logCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                log.info("Cookie Name: {}, Cookie Value: {}", cookie.getName(), cookie.getValue());
            }
        } else {
            log.info("No cookies found in the request.");
        }
    }

}
