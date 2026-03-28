package com.ecommerce.buyme.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecommerce.buyme.dtos.UserDto;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.request.CreateUserRequest;
import com.ecommerce.buyme.request.UpdateUserRequest;
import com.ecommerce.buyme.response.ApiResponse;
import com.ecommerce.buyme.service.user.IUserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("${api.prefix}/users")
@RequiredArgsConstructor
public class UserController {
    private final IUserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse> getAll() {
        List<User> users = userService.getAll();
        List<UserDto> userDtos = users.stream().map(userService::convertToDto).toList();
        return ResponseEntity.ok(new ApiResponse("Users retrieved successfully", userDtos));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> getUserById(@PathVariable Long userId) {
        User user = userService.getUserById(userId);
        UserDto userDto = userService.convertToDto(user);
        return ResponseEntity.ok(new ApiResponse("User retrieved successfully", userDto));
    }

    @DeleteMapping("/user/{userId}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Long userId) {
        userService.delete(userId);
        return ResponseEntity.ok(new ApiResponse("User deleted successfully", null));
    }

    @PostMapping("/add")
    public ResponseEntity<ApiResponse> create(@RequestBody CreateUserRequest request) {
        User user = userService.create(request);
        UserDto userDto = userService.convertToDto(user);
        return ResponseEntity.ok(new ApiResponse("User created successfully", userDto));
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<ApiResponse> update(@RequestBody UpdateUserRequest request, @PathVariable Long userId) {
        User user = userService.update(request, userId);
        UserDto userDto = userService.convertToDto(user);
        return ResponseEntity.ok(new ApiResponse("User updated successfully", userDto));
    }
}
