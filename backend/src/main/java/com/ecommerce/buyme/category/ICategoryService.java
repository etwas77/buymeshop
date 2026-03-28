package com.ecommerce.buyme.category;

import java.util.List;

import com.ecommerce.buyme.model.Category;

public interface ICategoryService {
    Category add(Category category);

    Category update(Category category, Long id);

    void delete(Long id);

    Category getByName(String name);

    Category getById(Long id);

    List<Category> getAll();

}
