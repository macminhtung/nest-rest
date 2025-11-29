# Projects API Endpoint

This document provides information about all available endpoints for managing projects.

[← Go to main docs](../API_DOCUMENTATION.md)

- [Users API Documentation](./users-api.md)
- [Tasks API Documentation](./tasks-api.md)

> **Note**: All requests must include the `x-api-key` header with any value to pass the authorization check. In these examples, the `x-api-key` header is omitted for brevity.

## Table of Contents

- [Get project by ID](#get-project-by-id)
- [Create project](#create-project)
- [Get project by name](#get-project-by-name)
- [Add user to project](#add-user-to-project)
- [Remove user from project](#remove-user-from-project)
- [Update project](#update-project)
- [Delete project](#delete-project)


## Get project by ID

Gets a project by its UUID.

```plaintext
GET /projects/:projectId
```

Supported attributes:

| Attribute   | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| `projectId` | string | Yes      | Unique project id in UUIDv4 format |

If successful, returns `200` and the following response attributes:

| Attribute     | Type   | Description                        |
|---------------|--------|------------------------------------|
| `id`          | string | Unique project id in UUIDv4 format |
| `name`        | string | Project name                       |
| `description` | string | Project description                |
| `createdAt`   | string | Project creation date              |
| `updatedAt`   | string | Project last update date           |

### Example request

```shell
curl --url "localhost:3000/projects/4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j6"
```
### Example response

```json
{
  "id": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j6",
  "name": "Project #1",
  "description": "This is a sample project.",
  "createdAt": "2025-02-01T12:00:00Z",
  "updatedAt": "2025-02-02T12:00:00Z"
}
```

## Get project by name

Gets a list of projects a specific user is in, based on their name.

```plaintext
GET /projects/name/:name?userId=:userId
```

Supported attributes:

| Attribute | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| `name`    | string | Yes      | Project name                    |
| `userId`  | string | Yes      | Unique user id in UUIDv4 format |

If successful, returns `200` and the following response attributes:

| Attribute     | Type   | Description                        |
|---------------|--------|------------------------------------|
| `id`          | string | Unique project id in UUIDv4 format |
| `name`        | string | Project name                       |
| `description` | string | Project description                |
| `createdAt`   | string | Project creation date              |
| `updatedAt`   | string | Project last update date           |
| `users`       | array  | List of users in the project       |

### Example request

```shell
curl --url "localhost:3000/projects/name/Project%20%231?userId=f445341c-2f63-4c99-9a75-b3ab5038514f"
```
### Example response

```json
{
  "id": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j6",
  "name": "Project #1",
  "description": "This is a sample project.",
  "createdAt": "2025-02-01T12:00:00Z",
  "updatedAt": "2025-02-02T12:00:00Z",
  "users": [
    {
      "id": "f445341c-2f63-4c99-9a75-b3ab5038514f",
      "firstName": "John",
      "lastName": "Doe",
      "email": "example@email.com",
      "location": "New York, NY"
    }
  ]
}
```

## Create Project

Creates a new project.

```plaintext
POST /projects/create
```

Supported attributes:

| Attribute     | Type   | Required | Description         |
|---------------|--------|----------|---------------------|
| `name`        | string | Yes      | Project name        |
| `description` | string | No       | Project description |

If successful, returns `201` and the following response attributes:

| Attribute     | Type   | Description                        |
|---------------|--------|------------------------------------|
| `id`          | string | Unique project id in UUIDv4 format |
| `name`        | string | Project name                       |
| `description` | string | Project description                |
| `createdAt`   | string | Project creation date              |
| `updatedAt`   | string | Project last update date           |

### Example request

```shell
curl --url "localhost:3000/projects" \
     --header "Content-Type: application/json" \
     --data '{
       "name": "Project #1",
       "description": "This is another sample project."
     }'
```
### Example response

```json
{
  "id": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7",
  "name": "Project #1",
  "description": "This is another sample project.",
  "createdAt": "2025-02-03T12:00:00Z",
  "updatedAt": "2025-02-03T12:00:00Z"
}
```

## Add user to project

Adds a user to a project.

```plaintext
PATCH /projects/users/add
```

Supported attributes:

| Attribute   | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| `projectId` | string | Yes      | Unique project id in UUIDv4 format |
| `userId`    | string | Yes      | Unique user id in UUIDv4 format    |

If successful, returns `200` and the following response attributes:

| Attribute     | Type   | Description                        |
|---------------|--------|------------------------------------|
| `id`          | string | Unique project id in UUIDv4 format |
| `name`        | string | Project name                       |
| `description` | string | Project description                |
| `createdAt`   | string | Project creation date              |
| `updatedAt`   | string | Project last update date           |
| `users`       | array  | List of users in the project       |

### Example request

```shell
curl --url "localhost:3000/projects/users/add" \
     --header "Content-Type: application/json" \
     --data '{
       "projectId": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7",
       "userId": "f445341c-2f63-4c99-9a75-b3ab5038514f"
     }'
```

### Example response

```json
{
  "id": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7",
  "name": "Project #1",
  "description": "This is another sample project.",
  "createdAt": "2025-02-03T12:00:00Z",
  "updatedAt": "2025-02-03T12:00:00Z",
  "users": [
    {
      "id": "f445341c-2f63-4c99-9a75-b3ab5038514f",
      "firstName": "John",
      "lastName": "Doe",
      "email": "email@example.com"
      "location": "New York, NY"
    }
  ]
}
```

## Remove user from project

Removes a user from a project.

```plaintext
PATCH /projects/users/remove
```

Supported attributes:

| Attribute   | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| `projectId` | string | Yes      | Unique project id in UUIDv4 format |
| `userId`    | string | Yes      | Unique user id in UUIDv4 format    |

If successful, returns `200` and the following response attributes:

| Attribute     | Type   | Description                        |
|---------------|--------|------------------------------------|
| `id`          | string | Unique project id in UUIDv4 format |
| `name`        | string | Project name                       |
| `description` | string | Project description                |
| `createdAt`   | string | Project creation date              |
| `updatedAt`   | string | Project last update date           |
| `users`       | array  | List of users in the project       |

### Example request

```shell
curl --url "localhost:3000/projects/users/remove" \
     --header "Content-Type: application/json" \
     --data '{
       "projectId": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7",
       "userId": "f445341c-2f63-4c99-9a75-b3ab5038514f"
     }'
```
### Example response

```json
{
  "id": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7",
  "name": "Project #1",
  "description": "This is another sample project.",
  "createdAt": "2025-02-03T12:00:00Z",
  "updatedAt": "2025-02-03T12:00:00Z",
  "users": []
}
```

## Update Project

Updates an existing project.

```plaintext
PATCH /projects/:projectId
```

Supported attributes:

| Attribute     | Type   | Required | Description                        |
|---------------|--------|----------|------------------------------------|
| `projectId`   | string | Yes      | Unique project id in UUIDv4 format |
| `name`        | string | No       | Project name                       |
| `description` | string | No       | Project description                |

If successful, returns `200` and the following response attributes:

| Attribute     | Type   | Description                        |
|---------------|--------|------------------------------------|
| `id`          | string | Unique project id in UUIDv4 format |
| `name`        | string | Project name                       |
| `description` | string | Project description                |
| `createdAt`   | string | Project creation date              |
| `updatedAt`   | string | Project last update date           |

### Example request

```shell
curl --url "localhost:3000/projects/4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7" \
     --header "Content-Type: application/json" \
     --data '{
       "name": "Project #1 Updated",
       "description": "This is an updated sample project."
     }'
```

### Example response

```json
{
  "id": "4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7",
  "name": "Project #1 Updated",
  "description": "This is an updated sample project.",
  "createdAt": "2025-02-03T12:00:00Z",
  "updatedAt": "2025-02-04T12:00:00Z"
}
```

## Delete Project

Deletes a project by its UUID.

```plaintext
DELETE /projects/:projectId
```

Supported attributes:

| Attribute   | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| `projectId` | string | Yes      | Unique project id in UUIDv4 format |

If successful, returns `200` and the following response attributes:

| Attribute | Type    | Description                          |
|-----------|---------|--------------------------------------|
| `deleted` | boolean | Indicates if the project was deleted |
| `message` | string  | Confirmation message                 |

### Example request

```shell
curl --url "localhost:3000/projects/4f3b2c1d-5e6f-7a8b-9c0d-e1f2g3h4i5j7"
```

### Example response

```json
{
  "deleted": true,
  "message": "Project deleted successfully."
}
```

<a href="./users-api.md">← Previous: Users Endpoint</a>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
<a href="./tasks-api.md">Next: Tasks Endpoint →</a>