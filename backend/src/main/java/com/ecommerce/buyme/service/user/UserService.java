package com.ecommerce.buyme.service.user;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ecommerce.buyme.dtos.AddressDto;
import com.ecommerce.buyme.dtos.UserDto;
import com.ecommerce.buyme.model.Address;
import com.ecommerce.buyme.model.Role;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.repository.AddressRepository;
import com.ecommerce.buyme.repository.RoleRepository;
import com.ecommerce.buyme.repository.UserRepository;
import com.ecommerce.buyme.request.CreateUserRequest;
import com.ecommerce.buyme.request.UpdateUserRequest;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
@RequiredArgsConstructor
public class UserService implements IUserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;
    private final AddressRepository addressRepository;
    private final RoleRepository roleRepository;

    @Override
    public User create(CreateUserRequest request) {
        Role userRole = Optional.ofNullable(roleRepository.findByName("ROLE_USER"))
                .orElseThrow(() -> new RuntimeException("Role not found."));
                
        return Optional.of(request).filter(user -> !userRepository.existsByEmail(user.getEmail()))
                .map(req -> {
                    User user = new User();
                    user.setFirstName(req.getFirstName());
                    user.setLastName(req.getLastName());
                    user.setEmail(req.getEmail());
                    user.setPassword(passwordEncoder.encode(req.getPassword()));
                    user.setRoles(Set.of(userRole));
                    User savedUser = userRepository.save(user);

                    Optional.ofNullable(req.getAddresses()).ifPresent(addresses -> {
                        addresses.forEach(address -> {
                            address.setUser(savedUser);
                            addressRepository.save(address);
                        });
                    });

                    return savedUser;
                })
                .orElseThrow(() -> new RuntimeException("user with " + request.getEmail() + " already exists."));
    }

    @Override
    public User update(UpdateUserRequest request, String userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    user.setFirstName(request.getFirstName());
                    user.setLastName(request.getLastName());

                    if (request.getRoles() != null) {
                        Set<Role> incomingRoles = request.getRoles().stream()
                            .filter(Objects::nonNull)
                            .map(roleDto -> roleDto.getName())
                            .map(roleName -> Optional.ofNullable(roleRepository.findByName(roleName))
                                .orElseThrow(() -> new RuntimeException("Role not found: " + roleName)))
                                .collect(Collectors.toSet());
                        user.setRoles(incomingRoles);
                    }

                    return userRepository.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    public void delete(String userId) {
        userRepository.deleteById(userId);
    }

    @Override
    public List<User> getAll() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    @Override
    public UserDto convertToDto(User user) {
        List<Address> addresses = addressRepository.findByUserId(user.getId());
        UserDto userDto = modelMapper.map(user, UserDto.class);
        userDto.setAddresses(addresses.stream().map(address -> modelMapper.map(address, AddressDto.class)).toList());
        return userDto;
    }

    @Override
    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }

        String email = authentication.getName();
        return Optional.ofNullable(userRepository.findByEmail(email))
                .orElseThrow(() -> new RuntimeException("Login required to access this resource"));
    }

}
