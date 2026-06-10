package com.ecommerce.buyme.security;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.ecommerce.buyme.model.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ShopUserDetails implements UserDetails {

    private String id;
    private String email;
    private String password;
    private Collection<GrantedAuthority> authorities;

    public static ShopUserDetails buildUserDetails(User user) {
        ShopUserDetails shopUserDetails = new ShopUserDetails();
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());
        shopUserDetails.authorities = authorities;
        shopUserDetails.id = user.getId();
        shopUserDetails.email = user.getEmail();
        shopUserDetails.password = user.getPassword();
        return shopUserDetails;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public @Nullable String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

}
