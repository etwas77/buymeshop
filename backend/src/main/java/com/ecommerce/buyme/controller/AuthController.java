package com.ecommerce.buyme.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.request.LoginRequest;
import com.ecommerce.buyme.security.ShopUserDetailService;
import com.ecommerce.buyme.security.jwt.JwtUtils;
import com.ecommerce.buyme.utils.CookieUtils;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.prefix}/auth")
public class AuthController {
    private final JwtUtils jwtUtils;
    private final CookieUtils cookieUtils;
    private final ShopUserDetailService userDetailsService;
    private final AuthenticationManager authenticationManager;

    @Value("${auth.token.refresh-expiration-in-mils}")
    private Long refreshTokenExpirationTime;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUserEntity(@RequestBody LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken = jwtUtils.generateAccessTokenForUser(authentication);
        String refreshToken = jwtUtils.generateRefreshTokenForUser(request.getEmail());
        cookieUtils.addRefreshTokenToCookie(refreshToken, response, refreshTokenExpirationTime);
        Map<String, String> tokens = new HashMap<>();
        tokens.put("accessToken", accessToken);
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessTocken(HttpServletRequest request) {
        cookieUtils.logCookies(request);
        String refreshToken = cookieUtils.getRefreshTokenFromCookies(request);
        if (refreshToken != null) {
            boolean isValid = jwtUtils.validateToken(refreshToken);
            if (isValid) {
                String userName = jwtUtils.getEmailFromToken(refreshToken);
                UserDetails userDetails = userDetailsService.loadUserByUsername(userName);
                String newAccessTocken = jwtUtils.generateAccessTokenForUser(
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
                if (newAccessTocken != null) {
                    Map<String, String> tokens = new HashMap<>();
                    tokens.put("accessToken", newAccessTocken);
                    return ResponseEntity.ok(tokens);
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate new access token");
                }
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Missing, invalid, or expired refresh token");
    }

}
