once application.properties configured, create db using MySQL Workbench
- create new schema "buyme_db", apply, apply, finish.
- run project


set of models: Product, Category, Image
set of roles: User, Cart, Cart_Item, Order, Role


user_id1 can have role_id1, role_id2.
user_id2 can have role_id1, role_id2. 
role_id1 will have user_id1, user_id2.
role_id2 will have user_id1, user_id2. 
so, user table will have column roles.
so, roles table will have column users.
why there is a need for intermediate table user_roles?

So for many-to-many (User ↔ Role):

If users table had a roles column, it would need to store multiple role IDs (like 1,2) → not proper relational design.
If roles table had a users column, same problem in reverse.
A single foreign key only supports one-to-many, not many-to-many.
user_roles solves this correctly by storing one relation per row:

(user_id=1, role_id=1)
(user_id=1, role_id=2)
(user_id=2, role_id=1)
...


-----------------------
expected upload way: 
@PostMapping("/api/v1/images/upload")
public ResponseEntity<List<ImageDto>> uploadImages(
        @RequestParam Long productId,
        @RequestParam List<MultipartFile> files) {
    List<ImageDto> dtos = imageService.saveImages(files, productId);
    return ResponseEntity.ok(dtos);

from the client-side it will be something like:
<form action="/api/v1/images/upload" method="POST" enctype="multipart/form-data">
    <input type="hidden" name="productId" value="42" />
    <input type="file" name="files" multiple />
    <button type="submit">Upload</button>
</form>
---------------------------

flow:

User builds Cart with CartItems
At checkout, system creates Order + OrderItems from the cart snapshot
Cart is cleared (or kept for future shopping)
Order remains as the permanent transaction record

