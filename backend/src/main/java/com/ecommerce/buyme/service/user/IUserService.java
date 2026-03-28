package com.ecommerce.buyme.service.user;

import java.util.List;

import com.ecommerce.buyme.dtos.UserDto;
import com.ecommerce.buyme.model.User;
import com.ecommerce.buyme.request.CreateUserRequest;
import com.ecommerce.buyme.request.UpdateUserRequest;

public interface IUserService {
    User create(CreateUserRequest request);

    User update(UpdateUserRequest request, Long userId);

    User getUserById(Long userId);

    List<User> getAll();

    void delete(Long userId);

    UserDto convertToDto(User user);

    User getAuthenticatedUser();
}
