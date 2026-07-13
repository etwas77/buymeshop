package com.ecommerce.buyme.controller;

import java.util.HashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.AuthDto;
import com.ecommerce.buyme.dtos.UserDto;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.request.LoginRequest;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.security.ShopUserDetailService;
import com.ecommerce.buyme.security.jwt.JwtUtils;
import com.ecommerce.buyme.service.user.IUserService;
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
    private final IUserService userService;

    @Value("${auth.token.refresh-expiration-in-mils}")
    private Long refreshTokenExpirationTime;

    @Value("${auth.token.access-expiration-in-mils}")
    private Long accessTokenExpirationTime;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> authenticateUserEntity(@RequestBody LoginRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        HashMap<String, Object> accessMap = jwtUtils.generateAccessTokenForUser(authentication);
        String accessToken = (String) accessMap.get("token");
        String refreshToken = jwtUtils.generateRefreshTokenForUser(request.getEmail());
        //cookieUtils.addRefreshTokenToCookie(refreshToken, response, refreshTokenExpirationTime);
        cookieUtils.addTokenToCookie(CookieUtils.CookieType.ACCESS, accessToken, response, accessTokenExpirationTime);
        cookieUtils.addTokenToCookie(CookieUtils.CookieType.REFRESH, refreshToken, response, refreshTokenExpirationTime);
        // Map<String, String> tokens = new HashMap<>();
        // tokens.put("accessToken", accessToken);
        String result = "login succeded: " + (accessToken != null);
        return ResponseEntity.ok(new ApiResponse(result, accessMap.get("authDto")));
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        cookieUtils.logCookies(request);
        String refreshToken = cookieUtils.getRefreshTokenFromCookies(request);
        if (refreshToken != null) {
            boolean isValid = jwtUtils.validateToken(refreshToken);
            if (isValid) {
                String userName = jwtUtils.getEmailFromToken(refreshToken);
                UserDetails userDetails = userDetailsService.loadUserByUsername(userName);
                HashMap<String, Object> accessMap = jwtUtils.generateAccessTokenForUser(
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities()));
                String newAccessToken = (String) accessMap.get("token");
                if (newAccessToken != null) {
                    // Map<String, String> tokens = new HashMap<>();
                    // tokens.put("accessToken", newAccessToken);
                    cookieUtils.addTokenToCookie(CookieUtils.CookieType.ACCESS, newAccessToken, response, accessTokenExpirationTime);
                    return ResponseEntity.ok(new ApiResponse("Access token refreshed successfully", null));
                } else {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to generate new access token");
                }
            }
        }
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Missing, invalid, or expired refresh token");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        cookieUtils.clearCookie(CookieUtils.CookieType.ACCESS, response);
        cookieUtils.clearCookie(CookieUtils.CookieType.REFRESH, response);
        return ResponseEntity.ok("logged out successfully");
    }

    @GetMapping("/me")
    public  ResponseEntity<ApiResponse> getMe() {
        User user = userService.getAuthenticatedUser();
        UserDto userDto = userService.convertToDto(user);
        AuthDto authDto = new AuthDto(userDto.getId(), userDto.getRoles());
        return ResponseEntity.ok(new ApiResponse( "Authenticated user", authDto));  
    }
    
    

}
