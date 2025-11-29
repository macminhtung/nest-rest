# Users API Endpoint

This document provides information about all available endpoints for managing users.

[← Go to main docs](../API_DOCUMENTATION.md)

- [Project API Documentation](./projects-api.md)
- [Tasks API Documentation](./tasks-api.md)

> **Note**: All requests must include the `x-api-key` header with any value to pass the authorization check. In these examples, the `x-api-key` header is omitted for brevity.

## Table of Contents

- [Get user by ID](#get-user-by-id)
- [Get user by email](#get-user-by-email)
- [Create User](#create-user)
- [Update User](#update-user)
- [Delete User](#delete-user)

## Get user by ID

Gets a user by their UUID.

```plaintext
GET /users/:userId
```

Supported attributes:

| Attribute | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| `userId`  | string | Yes      | Unique user id in UUIDv4 format |

If successful, returns `200` and the following response attributes:

| Attribute   | Type   | Description                     |
|-------------|--------|---------------------------------|
| `id`        | string | Unique user id in UUIDv4 format |
| `firstName` | string | User first name                 |
| `lastName`  | string | User last name                  |
| `email`     | string | User email                      |
| `location`  | string | User location                   |

### Example request

```shell
curl --url "localhost:3000/users/f445341c-2f63-4c99-9a75-b3ab5038514f"
```

### Example response

```json
{
  "id": "f445341c-2f63-4c99-9a75-b3ab5038514f",
  "firstName": "John",
  "lastName": "Doe",
  "email": "example@email.com",
  "location": "New York, NY"
}
```

## Get user by email

Gets a user by their email.

```plaintext
GET /users/email/:email
```

Supported attributes:

| Attribute | Type   | Required | Description |
|-----------|--------|----------|-------------|
| `email`   | string | Yes      | User email  |

If successful, returns `200` and the following response attributes:

| Attribute   | Type   | Description                     |
|-------------|--------|---------------------------------|
| `id`        | string | Unique user id in UUIDv4 format |
| `firstName` | string | User first name                 |
| `lastName`  | string | User last name                  |
| `email`     | string | User email                      |
| `location`  | string | User location                   |

### Example request

```shell
curl --url "localhost:3000/users/email/example@email.com"
```

### Example response

```json
{
  "id": "f445341c-2f63-4c99-9a75-b3ab5038514f",
  "firstName": "John",
  "lastName": "Doe",
  "email": "example@email.com",
  "location": "New York, NY"
}
```

## Create User

Creates a new user.

```plaintext
POST /users/create
```
Supported attributes:

| Attribute   | Type   | Required | Description     |
|-------------|--------|----------|-----------------|
| `firstName` | string | Yes      | User first name |
| `lastName`  | string | Yes      | User last name  |
| `email`     | string | Yes      | User email      |
| `location`  | string | Yes      | User location   |

If successful, returns `201` and the following response attributes:

| Attribute   | Type   | Description                     |
|-------------|--------|---------------------------------|
| `id`        | string | Unique user id in UUIDv4 format |
| `firstName` | string | User first name                 |
| `lastName`  | string | User last name                  |
| `email`     | string | User email                      |
| `location`  | string | User location                   |

### Example request

```shell
curl --header "Content-Type: application/json" \
     --request POST \
     --data '{
       "firstName": "John",
       "lastName": "Doe",
       "email": "example@email.com",
       "location": "New York, NY"
     }' \
     --url "localhost:3000/users"
```
### Example response

```json
{
  "id": "f445341c-2f63-4c99-9a75-b3ab5038514f",
  "firstName": "John",
  "lastName": "Doe",
  "email": "example@email.com",
  "location": "New York, NY"
}
```

## Update User

Updates an existing user.

```plaintext
PATCH /users/:userId
```

Supported attributes:

| Attribute   | Type   | Required | Description                     |
|-------------|--------|----------|---------------------------------|
| `userId`    | string | Yes      | Unique user id in UUIDv4 format |
| `firstName` | string | No       | User first name                 |
| `lastName`  | string | No       | User last name                  |
| `email`     | string | No       | User email                      |
| `location`  | string | No       | User location                   |

If successful, returns `200` and the following response attributes:

| Attribute   | Type   | Description                     |
|-------------|--------|---------------------------------|
| `id`        | string | Unique user id in UUIDv4 format |
| `firstName` | string | User first name                 |
| `lastName`  | string | User last name                  |
| `email`     | string | User email                      |
| `location`  | string | User location                   |

### Example request

```shell
curl --header "Content-Type: application/json" \
     --request PATCH \
     --data '{
       "firstName": "Jane",
       "lastName": "Sith",
     }' \
     --url "localhost:3000/users/f445341c-2f63-4c99-9a75-b3ab5038514f"
```

### Example response

```json
{
  "id": "f445341c-2f63-4c99-9a75-b3ab5038514f",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "example@email.com",
  "location": "New York, NY"
}
```

## Delete User

Deletes a user.

```plaintext
DELETE /users/:userId
```

Supported attributes:

| Attribute | Type   | Required | Description    |
|-----------|--------|----------|----------------|
| `userId`  | string | Yes      | Unique user id |

If successful, returns `200` and the following response attributes:

| Attribute | Type    | Description                  |
|-----------|---------|------------------------------|
| `deleted` | boolean | Whether the user was deleted |
| `message` | string  | Message confirming deletion  |

### Example request

```shell
curl --request DELETE \
     --url "localhost:3000/users/f445341c-2f63-4c99-9a75-b3ab5038514f"
```
### Example response

```json
{
  "deleted": true,
  "message": "User deleted successfully"
}
```
<br>

<a href="../API_DOCUMENTATION.md">← Previous: Main Docs</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="./projects-api.md">Next: Projects Endpoint →</a>