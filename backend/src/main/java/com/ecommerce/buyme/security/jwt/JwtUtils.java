package com.ecommerce.buyme.security.jwt;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.ecommerce.buyme.dtos.AuthDto;
import com.ecommerce.buyme.dtos.RoleDto;
import com.ecommerce.buyme.security.ShopUserDetails;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtUtils {
    @Value("${auth.token.secret}")
    private String jwtSecret;

    @Value("${auth.token.access-expiration-in-mils}")
    private String expirationTime;

    @Value("${auth.token.refresh-expiration-in-mils}")
    private String refreshExpirationTime;

    public HashMap<String, Object> generateAccessTokenForUser(Authentication authentication) {
        ShopUserDetails userPrincipal = (ShopUserDetails) authentication.getPrincipal();

        List<String> roles = userPrincipal.getAuthorities().stream()
                .filter(Objects::nonNull)
                .map(authority -> authority.getAuthority())
                .toList();

        AuthDto authDto = new AuthDto(userPrincipal.getId(), roles.stream().map(RoleDto::new).collect(Collectors.toSet()));

        String token =  Jwts.builder()
                .setSubject(userPrincipal.getEmail())
                .claim("id", userPrincipal.getId())
                .claim("roles", roles)
                .setIssuedAt(new Date())
                .setExpiration(calculateFromMillis(expirationTime))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();

        HashMap<String, Object> retObject = new HashMap<>();
        retObject.put("token", token);
        retObject.put("authDto", authDto);
        return retObject;
    }

    public String generateRefreshTokenForUser(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(calculateFromMillis(refreshExpirationTime))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
    }

    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("Invalid JWT token: " + e.getMessage());
            return false;
        }
    }

    private Date calculateFromMillis(String timeInMillis) {
        return new Date(System.currentTimeMillis() + Long.parseLong(timeInMillis));
    }
}
