package com.ecommerce.buyme.data;

import java.util.Set;
import java.util.stream.Collectors;
import java.util.Objects;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import com.ecommerce.buyme.model.Role;
import com.ecommerce.buyme.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationListener<ApplicationReadyEvent> {
    private final RoleRepository roleRepository;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        Set<String> roles = Set.of("ROLE_USER", "ADMIN");   // Add more roles as needed, will be added only if not already present in the database
        initializeRoles(roles);
    }

    private void initializeRoles(Set<String> roles) {
        Set<String> existingRoleNames = roleRepository.findAll().stream()
            .filter(Objects::nonNull)
            .map(roleDto -> roleDto.getName())
            .collect(Collectors.toSet());

        roles.stream()
                .filter(roleName -> !existingRoleNames.contains(roleName))
                .forEach(roleName -> roleRepository.save(new Role(roleName)));
    }

}
