example implementation of ecommerce web application. 
- backend using java spring;
- frontend using reactjs;
- JWT authentication, using Http-Only cookie set:
    - some backend endpoints are secured with token;
    - some frontend routes are secured;
    - some endpoint within controller are secured using Role;
- mysql as db (branch "mysql");
- mongodb as db (branch "mongo");

currently under develop branch: working on migration from "JWT token in localstorage on client side" to "HttpOnly cookie for all auth"
