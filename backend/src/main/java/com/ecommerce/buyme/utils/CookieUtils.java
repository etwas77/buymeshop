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

    private static final String REFRESH_TOKEN_COOKIE = "refreshToken";
    private static final String ACCESS_TOKEN_COOKIE = "accessToken";

    public static enum CookieType {
        REFRESH,
        ACCESS
    }
    
    @Value("${app.use-secure-cookie}")
    private boolean useSecureCookie;

    // public void addRefreshTokenToCookie(String refreshToken, HttpServletResponse response, long maxAge) {
    //     if (response == null) {
    //         throw new IllegalArgumentException("HttpServletResponse cannot be null");
    //     }

    //     addCookie(REFRESH_TOKEN_COOKIE, refreshToken, response, maxAge, getSameSiteAttribute());
    // }

    public void addTokenToCookie(CookieType tokenType, String accessToken, HttpServletResponse response, long maxAge) {
        if (response == null) {
            throw new IllegalArgumentException("HttpServletResponse cannot be null");
        }
        String cookienName = tokenType == CookieType.REFRESH ? REFRESH_TOKEN_COOKIE : ACCESS_TOKEN_COOKIE;
        addCookie(cookienName, accessToken, response, maxAge, getSameSiteAttribute());
    }

    private void addCookie(String name, String value, HttpServletResponse response, long maxAge, String sameSite) {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(this.useSecureCookie);
        cookie.setPath("/");
        cookie.setMaxAge((int) (maxAge / 1000));
        setResponseHeader(response, cookie, sameSite);
    }

    public void clearCookie(CookieType tokenType, HttpServletResponse response) {
        String cookienName = tokenType == CookieType.REFRESH ? REFRESH_TOKEN_COOKIE : ACCESS_TOKEN_COOKIE;
        addCookie(cookienName, "", response, 0, getSameSiteAttribute());
    }

    private String getSameSiteAttribute() {
        return this.useSecureCookie ? "None" : "Lax";
    }

    public String getTokenFromCookies(CookieType tokenType, HttpServletRequest request) {
        String cookieName = tokenType == CookieType.REFRESH ? REFRESH_TOKEN_COOKIE : ACCESS_TOKEN_COOKIE;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void setResponseHeader(HttpServletResponse response, Cookie cookie, String sameSite) {
        StringBuffer header = new StringBuffer();
        header.append(cookie.getName()).append("=").append(cookie.getValue())
                .append("; HttpOnly; Path=").append(cookie.getPath())
                .append("; Max-Age=").append(cookie.getMaxAge())
                .append(this.useSecureCookie ? "; Secure" : "")
                .append("; SameSite=").append(sameSite);

        response.addHeader("Set-Cookie", header.toString());
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
