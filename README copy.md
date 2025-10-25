# User and Group Management API Service

A RESTful API service built with Node.js, Express.js, and MySQL for managing users and groups.<br>
This implementation uses raw SQL queries via the `mysql2` library (without ORM) and includes features like input validation using `Joi` for request bodies, query parameters and pagination for listing users (`GET /api/v1/users`) and groups (`GET /api/v1/groups`), and integration tests of API endpoints using `jest` and `axios`.

## Getting Started

### Prerequisites
*   [Docker](https://www.docker.com/get-started/)

### Installation

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/rvg07/user_management.git
    ```
2.  **Enter to the Project Directory:**
    ```bash
    cd user_management
    ```
3.  **Configure Environment Variables:**

    - Copy the example environment file `.env.example` in the root project:
      ```bash
      cp .env.example .env
      ```
    - In the `.env` file please pay close attention to:
      - `APP_PORT`: the port where our service will be accessible on our host machine.
      - `DB_HOST=db`: for Docker Compose networking. **Important:** you must keep this as `db`.
      - `DB_HOST_PORT`: the port used to connect directly to the MySQL db container.
      - `DB_NAME`: the name of the database schema that the MySQL db container.
      - `DB_USER`: the username that the MySQL db container will create and grant privileges to.
      - `DB_PASSWORD`: the password for the `DB_USER`.
      - `DB_ROOT_PASSWORD`: the root privilege password for our MySQL db container.

4.  **Build and Run with Docker Compose:**

    ```bash
    docker-compose up --build -d
    ```

    - We use `-d` to run in detached mode.

5.  **Access the API:**
    - The API should be running at `http://localhost:<APP_PORT>/api/v1`.
    - You can check the root endpoint: e.g. `curl http://localhost:3000/api/v1`.

### Integration Tests

6.  In a separate terminal run:
    ```bash
    npm test
    ```
    - `jest` finds and executes the `*.test.js` files.
    - Tests inside these files use `axios` to send HTTP requests.

## API Documentation

### Base URL

All API endpoints are prefixed with `/api/v1`. This is an example: `http://localhost:3000/api/v1/users`

### Authentication

There is no authentication because **not implemented**. All endpoints are open.

---

### Users (`/users`)

<details>
 <summary><code>POST</code> <code><b>/users</b></code> <code>(Create New User)</code></summary>

##### Request Body

> Requires a JSON request body with user details.

> | Field        | Required | Data Type                            | Description          | Example        |
> | ------------ | -------- | ------------------------------------ | -------------------- | -------------- |
> | `name`       | Yes      | `string`                             | User's first name    | `"Fatima"`     |
> | `surname`    | Yes      | `string`                             | User's last name     | `"Hanna"`      |
> | `birth_date` | Yes      | `string` (YYYY-MM-DD)                | User's date of birth | `"2000-01-01"` |
> | `sex`        | Yes      | `string` ('male'\|'female'\|'other') | User's sex           | `"female"`     |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                        | Description            |
> | --------- | ------------------ | ---------------------------------------------------------------------------- | ---------------------- |
> | `201`     | `application/json` | `{status":"success", "message":"User created successfully!", "userId": 123}` | User created.          |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}`               | Invalid input.         |
> | `409`     | `application/json` | `{"status":"error", "code":"ER_DUP_ENTRY", "message":"...already exists!"}`  | Duplicate user.        |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`               | Internal server error. |

##### Example cURL

> ```bash
> curl -X POST \
>   -H "Content-Type: application/json" \
>   -d '{"name":"Fatima","surname":"Hanna","birth_date":"2000-01-01","sex":"female"}' \
>   http://localhost:3000/api/v1/users
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/users</b></code> <code>(List Users - Paginated)</code></summary>

##### Query Parameters

> | Parameter | Required | Data Type | Default | Max | Description               | Example |
> | --------- | -------- | --------- | ------- | --- | ------------------------- | ------- |
> | `page`    | No       | `integer` | 1       | N/A | Page number to retrieve.  | `2`     |
> | `limit`   | No       | `integer` | 10      | 100 | Number of users per page. | `20`    |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                                                                            | Description                   |
> | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
> | `200`     | `application/json` | `{"status":"success", "data":[user...], "pagination":{ "totalItems": ..., "totalPages":.., "currentPage":..., "pageSize": ...}}` | List of users with pagination |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`                                                                   | Internal server error.        |

##### Example cURL

> Get page 2 with 5 users per page:
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/users?page=2&limit=5"
> ```
>
> Get first page (as default defined):
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/users"
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/users/{id}</b></code> <code>(Get User by ID)</code></summary>

##### Path Parameters

> | Parameter | Required | Data Type | Description                |
> | --------- | -------- | --------- | -------------------------- |
> | `id`      | Yes      | `integer` | ID of the user to retrieve |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                          | Description            |
> | --------- | ------------------ | -------------------------------------------------------------- | ---------------------- |
> | `200`     | `application/json` | `{ id: 1, name: "Test", surname: "User", ... }`                | User found.            |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}` | Invalid userId format  |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`      | userId not found.      |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}` | Internal server error. |

##### Example cURL

> Get user with userId `1`:
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/users/1"
> ```

</details>

<details>
 <summary><code>PUT</code> <code><b>/users/{id}</b></code> <code>(Update User)</code></summary>

##### Path Parameters

> | Parameter | Required | Data Type | Description               |
> | --------- | -------- | --------- | ------------------------- |
> | `id`      | Yes      | `integer` | ID of the user to update. |

##### Request Body

> Requires a JSON request body containing **at least one** field to update.

> | Field        | Required | Data Type                            | Description          | Example        |
> | ------------ | -------- | ------------------------------------ | -------------------- | -------------- |
> | `name`       | No       | `string`                             | User's first name    | `"Fatima"`     |
> | `surname`    | No       | `string`                             | User's last name     | `"Hanna"`      |
> | `birth_date` | No       | `string` (YYYY-MM-DD)                | User's date of birth | `"2001-01-01"` |
> | `sex`        | No       | `string` ('male'\|'female'\|'other') | User's sex           | `"female"`     |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                              | Description                                          |
> | --------- | ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------- |
> | `200`     | `application/json` | `{"status":"success", "message":"User updated successfully!", "user": userObject}` | User updated successfully.                           |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."`                      | Invalid body data.                                   |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`                          | userId not found.                                    |
> | `409`     | `application/json` | `{"status":"error", "code":"ER_DUP_ENTRY", "message":"...already exists!"}`        | Update caused a conflict with the unique constraint. |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`                     | Internal server error.                               |

##### Example cURL

> Update only the name for userId `1`:
>
> ```bash
> curl -X PUT \
>   -H "Content-Type: application/json" \
>   -d '{"birth_date": "2000-01-01"}' \
>   http://localhost:3000/api/v1/users/1
> ```

</details>

<details>
 <summary><code>DELETE</code> <code><b>/users/{id}</b></code> <code>(Delete User)</code></summary>

##### Path Parameters

> | Parameter | Required | Data Type | Description              |
> | --------- | -------- | --------- | ------------------------ |
> | `id`      | Yes      | `integer` | ID of the user to delete |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                          | Description            |
> | --------- | ------------------ | -------------------------------------------------------------- | ---------------------- |
> | `204`     | (No Content)       | (Empty)                                                        |                        |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}` | Invalid userId format  |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`      | userId not found.      |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}` | Internal server error. |

##### Example cURL

> Delete user with ID 1:
>
> ```bash
> curl -X DELETE -i "http://localhost:3000/api/v1/users/1"
> ```

</details>

---

### Associations (`/associations`)

These endpoints manage the association between users and groups.

<details>
 <summary><code>POST</code> <code><b>/associations</b></code> <code>(Create Association between User and Group)</code></summary>

##### Request Body

> Requires a JSON request body specifying the userId and groupId.

> | Field     | Required | Data Type | Description  | Example |
> | --------- | -------- | --------- | ------------ | ------- |
> | `userId`  | Yes      | `integer` | ID of user.  | `1`     |
> | `groupId` | Yes      | `integer` | ID of group. | `1`     |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                                      | Description                  |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------ | ---------------------------- |
> | `201`     | `application/json` | `{"status":"success", "message":"Association created between userId: 123 and groupId: 1"}` | Association created.         |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"...", "params": [...]}`            | Invalid params.              |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"UserId: ... not found!"}`               | userId does not exist.       |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"GroupId: ... not found!"}`              | groupId does not exist.      |
> | `409`     | `application/json` | `{"status":"error", "code":"ER_DUP_ENTRY", "message":"Association name already exists!!"}` | Association already existed. |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`                             | Internal server error.       |

##### Example cURL

> Association between userId 1 with groupId 1:
>
> ```bash
> curl -X POST \
>   -H "Content-Type: application/json" \
>   -d '{"userId": 1, "groupId": 1}' \
>   http://localhost:3000/api/v1/associations
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/associations</b></code> <code>(List Users/Groups)</code></summary>

##### Query Parameters

> **Note:** Provide **EITHER** `userId` **OR** `groupId`, but **NOT BOTH**.

> | Parameter | Required    | Data Type | Description                                   | Example |
> | --------- | ----------- | --------- | --------------------------------------------- | ------- |
> | `userId`  | Conditional | `integer` | Get the groups of a specific user is part of. | `1`     |
> | `groupId` | Conditional | `integer` | Get users in a specific group.                | `1`     |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                          | Description                                                             |
> | --------- | ------------------ | -------------------------------------------------------------- | ----------------------------------------------------------------------- |
> | `200`     | `application/json` | `{status: "success", groups}`                                  | Success if query is done by `userId` and returns list of Group objects. |
> | `200`     | `application/json` | `{status: "success", users}`                                   | Success if query is done by `groupId` and returns list of User objects. |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}` | Missing query param, both provided or invalid params format.            |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`      | UserId or GroupId not found.                                            |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}` | Internal server error                                                   |

##### Example cURL

> Get groups for userId 1:
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/associations?userId=1"
> ```
>
> Get users for groupId 1:
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/associations?groupId=1"
> ```

</details>

<details>
 <summary><code>DELETE</code> <code><b>/associations</b></code> <code>(Delete Association User from Group)</code></summary>

##### Query Parameters

> **Note:** Requires `userId`.

> | Parameter | Required | Data Type | Description                        | Example |
> | --------- | -------- | --------- | ---------------------------------- | ------- |
> | `userId`  | Yes      | `integer` | ID of the user in the association. | `1`     |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                           | Description                     |
> | --------- | ------------------ | ------------------------------------------------------------------------------- | ------------------------------- |
> | `200`     | `application/json` | `{"status":"success", "message":"The userId: ... is removed from group!"}`      | Association deleted.            |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}`                  | Missing or invalid query param. |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"Association... not found."}` | The association does not exist. |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`                  | Internal server error.          |

##### Example cURL

> Remove userId: 1:
>
> ```bash
> curl -X DELETE -i "http://localhost:3000/api/v1/associations?userId=1"
> ```

</details>

---

### Groups (`/groups`)

<details>
 <summary><code>POST</code> <code><b>/groups</b></code> <code>(Create New Group)</code></summary>

##### Request Body

> Requires a JSON request body with group details.

> | Field  | Required | Data Type | Description  | Example             |
> | ------ | -------- | --------- | ------------ | ------------------- |
> | `name` | Yes      | `string`  | Group's name | `"Gli Invincibili"` |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                        | Description            |
> | --------- | ------------------ | ---------------------------------------------------------------------------- | ---------------------- |
> | `201`     | `application/json` | `{status":"success", "message":"Group created successfully!", "groupId": 1}` | User created.          |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}`               | Invalid input.         |
> | `409`     | `application/json` | `{"status":"error", "code":"ER_DUP_ENTRY", "message":"...already exists!"}`  | Duplicate user.        |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`               | Internal server error. |

##### Example cURL

> ```bash
> curl -X POST \
>   -H "Content-Type: application/json" \
>   -d '{"name":"Gli Invincibili"}' \
>   http://localhost:3000/api/v1/groups
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/groups</b></code> <code>(List Groups - Paginated)</code></summary>

##### Query Parameters

> | Parameter | Required | Data Type | Default | Max | Description               | Example |
> | --------- | -------- | --------- | ------- | --- | ------------------------- | ------- |
> | `page`    | No       | `integer` | 1       | N/A | Page number to retrieve.  | `2`     |
> | `limit`   | No       | `integer` | 10      | 100 | Number of users per page. | `20`    |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                                                                             | Description                    |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
> | `200`     | `application/json` | `{"status":"success", "data":[group...], "pagination":{ "totalItems": ..., "totalPages":.., "currentPage":..., "pageSize": ...}}` | List of groups with pagination |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`                                                                    | Internal server error.         |

##### Example cURL

> Get page 2 with 5 groups per page:
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/groups?page=2&limit=5"
> ```
>
> Get first page (as default defined):
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/groups"
> ```

</details>

<details>
 <summary><code>GET</code> <code><b>/groups/{id}</b></code> <code>(Get Group by ID)</code></summary>

##### Path Parameters

> | Parameter | Required | Data Type | Description                 |
> | --------- | -------- | --------- | --------------------------- |
> | `id`      | Yes      | `integer` | ID of the group to retrieve |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                          | Description            |
> | --------- | ------------------ | -------------------------------------------------------------- | ---------------------- |
> | `200`     | `application/json` | `{ id: 1, name: "Gli Invincibili", ... }`                      | Group found.           |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}` | Invalid groupId format |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`      | groupId not found.     |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}` | Internal server error. |

##### Example cURL

> Get user with groupId `1`:
>
> ```bash
> curl -X GET -i "http://localhost:3000/api/v1/groups/1"
> ```

</details>

<details>
 <summary><code>PUT</code> <code><b>/groups/{id}</b></code> <code>(Update Group)</code></summary>

##### Path Parameters

> | Parameter | Required | Data Type | Description                |
> | --------- | -------- | --------- | -------------------------- |
> | `id`      | Yes      | `integer` | ID of the group to update. |

##### Request Body

> Requires a JSON request body containing **at least one** field to update.

> | Field  | Required | Data Type | Description      | Example               |
> | ------ | -------- | --------- | ---------------- | --------------------- |
> | `name` | No       | `string`  | Group's new name | `"Gli Invincibili 2"` |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                                                 | Description                                          |
> | --------- | ------------------ | ------------------------------------------------------------------------------------- | ---------------------------------------------------- |
> | `200`     | `application/json` | `{"status":"success", "message":"Group updated successfully!", "group": groupObject}` | Group updated successfully.                          |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."`                         | Invalid body data.                                   |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`                             | groupId not found.                                   |
> | `409`     | `application/json` | `{"status":"error", "code":"ER_DUP_ENTRY", "message":"...already exists!"}`           | Update caused a conflict with the unique constraint. |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}`                        | Internal server error.                               |

##### Example cURL

> Update only the name for groupId `1`:
>
> ```bash
> curl -X PUT \
>   -H "Content-Type: application/json" \
>   -d '{"name": "Gli Invincibili 2"}' \
>   http://localhost:3000/api/v1/groups/1
> ```

</details>

<details>
 <summary><code>DELETE</code> <code><b>/groups/{id}</b></code> <code>(Delete Group)</code></summary>

##### Path Parameters

> | Parameter | Required | Data Type | Description               |
> | --------- | -------- | --------- | ------------------------- |
> | `id`      | Yes      | `integer` | ID of the group to delete |

##### Responses

> | HTTP Code | Content-Type       | Response Body Example                                          | Description            |
> | --------- | ------------------ | -------------------------------------------------------------- | ---------------------- |
> | `204`     | (No Content)       | (Empty)                                                        |                        |
> | `400`     | `application/json` | `{"status":"error", "code":"INVALID_PARAMS", "message":"..."}` | Invalid groupId format |
> | `404`     | `application/json` | `{"status":"error", "code":"NOT_FOUND", "message":"..."}`      | groupId not found.     |
> | `500`     | `application/json` | `{"status":"error", "code":"INTERNAL_ERROR", "message":"..."}` | Internal server error. |

##### Example cURL

> Delete group with ID 1:
>
> ```bash
> curl -X DELETE -i "http://localhost:3000/api/v1/groups/1"
> ```

</details>
