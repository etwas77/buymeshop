package com.ecommerce.buyme.category;

import java.util.List;

import com.ecommerce.buyme.model.Category;

public interface ICategoryService {
    Category add(Category category);

    Category update(Category category, String id);

    void delete(String id);

    Category getByName(String name);

    Category getById(String id);

    List<Category> getAll();

}
