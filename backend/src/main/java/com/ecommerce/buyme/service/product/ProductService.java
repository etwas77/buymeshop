package com.ecommerce.buyme.service.product;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecommerce.buyme.dtos.ImageDto;
import com.ecommerce.buyme.dtos.ProductDto;
import com.ecommerce.buyme.model.Cart;
import com.ecommerce.buyme.model.CartItem;
import com.ecommerce.buyme.model.Category;
import com.ecommerce.buyme.model.Image;
import com.ecommerce.buyme.model.OrderItem;
import com.ecommerce.buyme.model.Product;
import com.ecommerce.buyme.repository.CartItemRepository;
import com.ecommerce.buyme.repository.CategoryRepository;
import com.ecommerce.buyme.repository.ImageRepository;
import com.ecommerce.buyme.repository.OrderItemRepository;
import com.ecommerce.buyme.repository.ProductRepository;
import com.ecommerce.buyme.request.AddProductRequest;
import com.ecommerce.buyme.request.ProductUpdateRequest;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService implements IProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final ImageRepository imageRepository;
    private final ModelMapper modelMapper;

    @Override
    public Product add(AddProductRequest request) {
        if (isProductExists(request.getName(), request.getBrand())) {
            throw new EntityExistsException(request.getName() + " already exists.");
        }
        Category category = Optional.ofNullable(categoryRepository.findByName(request.getCategory().getName()))
                .orElseGet(() -> {
                    return categoryRepository.save(new Category(request.getCategory().getName()));
                });
        request.setCategory(category);
        return productRepository.save(createProduct(request, category));
    }

    private boolean isProductExists(String name, String brand) {
        return productRepository.existsByNameAndBrand(name, brand);
    }

    private Product createProduct(AddProductRequest request, Category category) {
        return new Product(
                request.getName(),
                request.getBrand(),
                request.getPrice(),
                request.getInventory(),
                request.getDescription(),
                category);
    }

    @Override
    public Product update(ProductUpdateRequest request, Long productId) {
        return productRepository.findById(productId).map(pro -> {
            return productRepository.save(updateExistingProduct(pro, request));
        }).orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
    }

    @Override
    public Product getById(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + productId));
    }

    @Override
    @Transactional
    public ProductDto removeImage(Long productId, Long imageId) {
        Product product = getById(productId);
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new EntityNotFoundException("Image not found with id: " + imageId));

        if (image.getProduct() == null || !productId.equals(image.getProduct().getId())) {
            throw new EntityNotFoundException(
                    "Image with id: " + imageId + " does not belong to product with id: " + productId);
        }

        if (product.getImages() != null) {
            product.getImages().removeIf(existing -> imageId.equals(existing.getId()));
        }
        imageRepository.delete(image);
        return convertToDto(product);
    }

    private Product updateExistingProduct(Product product, ProductUpdateRequest request) {
        product.setName(request.getName());
        product.setBrand(request.getBrand());
        product.setPrice(request.getPrice());
        product.setInventory(request.getInventory());
        product.setDescription(request.getDescription());
        // Update images collection in-place and set product reference for each image
        // product.getImages().clear();
        // if (request.getImages() != null) {
        // for (Image image : request.getImages()) {
        // image.setProduct(product);
        // product.getImages().add(image);
        // }
        // }

        // Only touch images when client explicitly sends images.
        // null = keep current images unchanged.
        if (request.getImages() != null) {
            List<Image> resolvedImages = resolveImagesForProductUpdate(product, request.getImages());
            product.getImages().clear();
            product.getImages().addAll(resolvedImages);
        }

        Category cat = request.getCategory();
        String categoryName = cat.getName();
        Category category = categoryRepository.findByName(categoryName);
        product.setCategory(category);
        return product;
    }

    @Override
    public void delete(Long productId) {
        productRepository.findById(productId).ifPresentOrElse(pro -> {
            List<CartItem> cartItems = cartItemRepository.findByProductId(productId);
            cartItems.forEach(item -> {
                Cart cart = item.getCart();
                cart.removeItem(item);
                cartItemRepository.delete(item);
            });

            List<OrderItem> orderItems = orderItemRepository.findByProductId(productId);
            orderItems.forEach(item -> {
                item.setProduct(null);
                orderItemRepository.save(item);
            });

            Optional.ofNullable(pro.getCategory().getProducts().remove(pro));
            pro.setCategory(null);

            productRepository.deleteById(pro.getId());

        }, () -> {
            throw new EntityNotFoundException("Product not found with id: " + productId);
        });
    }

    @Override
    public List<Product> getAll() {
        return productRepository.findAll();
    }

    @Override
    public List<Product> getByBrandAndName(String brand, String name) {
        return productRepository.findByBrandAndName(brand, name);
    }

    @Override
    public List<Product> getByCategory(Category category) {
        return productRepository.findByCategoryName(category.getName());
    }

    @Override
    public List<Product> getByBrand(String brand) {
        return productRepository.findByBrand(brand);
    }

    @Override
    public List<Product> getByName(String name) {
        return productRepository.findByName(name);
    }

    @Override
    public List<Product> getByCategoryAndBrand(Category category, String brand) {
        return productRepository.findByCategoryNameAndBrand(category.getName(), brand);
    }

    @Override
    public List<ProductDto> convertProductsToDto(List<Product> products) {
        return products.stream()
                .map(this::convertToDto)
                .toList();
    }

    @Override
    public ProductDto convertToDto(Product product) {
        ProductDto productDto = modelMapper.map(product, ProductDto.class);
        List<Image> images = imageRepository.findByProductId(product.getId());
        List<ImageDto> imageDtos = images.stream()
                .map(image -> modelMapper.map(image, ImageDto.class))
                .toList();
        productDto.setImages(imageDtos);
        return productDto;
    }

    @Override
    public List<Product> findDistinctProductsByNameList() {
        List<Product> products = getAll();
        Map<String, Product> distinctProductsMap = products.stream()
                .collect(Collectors.toMap(
                        Product::getName,
                        product -> product,
                        (existing, replacement) -> existing));
        // duplicate names will be resolved by keeping the existing product and ignoring
        // the replacement
        return new ArrayList<>(distinctProductsMap.values());
    }

    @Override
    public List<String> getAllDistinctBrands() {
        return productRepository.findAll().stream().map(Product::getBrand).distinct().toList();
    }

    private List<Image> resolveImagesForProductUpdate(Product product, List<ImageDto> imageDtos) {
        List<Image> resolved = new ArrayList<>();

        for (ImageDto dto : imageDtos) {
            if (dto.getId() == null) {
                throw new EntityNotFoundException("Image id is required in product update payload");
            }

            Image image = imageRepository.findById(dto.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Image not found with id: " + dto.getId()));

            // Prevent attaching an image belonging to another product
            if (image.getProduct() != null && !product.getId().equals(image.getProduct().getId())) {
                throw new EntityNotFoundException(
                        "Image with id: " + dto.getId() + " does not belong to product with id: " + product.getId());
            }

            image.setProduct(product);
            resolved.add(image);
        }

        return resolved;
    }
}
