package com.ecommerce.buyme.category;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.ecommerce.buyme.model.Category;
import com.ecommerce.buyme.repository.CategoryRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService implements ICategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public Category add(Category category) {
        Category existingCategory = categoryRepository.findByName(category.getName());
        if (existingCategory != null) {
            throw new EntityNotFoundException("Category with name already exists: " + category.getName());
        }
        return categoryRepository.save(category);
    }

    @Override
    public Category update(Category category, Long id) {
        return categoryRepository.findById(id).map(cat -> {
            cat.setName(category.getName());
            return categoryRepository.save(cat);
        }).orElseThrow(() -> new EntityNotFoundException("No such category with id exists: " + id));    
    }

    @Override
    public void delete(Long id) {
        categoryRepository.findById(id).ifPresentOrElse(cat -> categoryRepository.delete(cat)
        , () -> { throw new EntityNotFoundException("No such category with id exists: " + id); });
    }

    @Override
    public Category getByName(String name) {
        return Optional.ofNullable(categoryRepository.findByName(name))
                .orElseThrow(() -> new EntityNotFoundException("No such category exists: " + name));
    }

    @Override
    public Category getById(Long id) {
        return categoryRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("No such category with id exists: " + id));
    }

    @Override
    public List<Category> getAll() {
        return categoryRepository.findAll();
    }

}
