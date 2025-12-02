### Greetings developer!

### Thanks for your attention to XT Solution first

### Please read this instructions care fully before try

![XT Solution!](/img/logo.svg 'XT Solutio')

# Instruction

1. Create a **🔒<ins>private</ins>🔒 repository** on **Github** based on this Base project.

   Please code so that all of the [requirements](#requirements) below are satisfied.

   From a collaboration perspective, your ability to use Git is also evaluated. So actively use **Gitflow.**

   For every commits has **Commit message** that concisely and clearly explains the purpose of the smallest unit of Commit.

2. Please add the following user as a collaborator on Github.
   - github user name : JoJakeTaemoon
   - github user email : whxoans@gmail.com

3. Once completed, fill in the [full name and email](#assignment-applicantor) in READ.md, (To avoid with another applicant)

4. Upload the code to the final Master branch, and notify the HR Manager of XT Solutions.

5. Then wait our contact please

# Requirements

- The result must <ins>run without Docker<ins>.
- Keep the .env.\* files (No editing)
- Make all works above running commands in scripts(package.json)
- Generate the migrations with provided ERD in <ins>src/migrations</ins>
- **Implement the task service** in <ins>src/api/tasks</ins> by referring to other services, modules, DTOs, and the tasks-api.md document.
- Wrtie the test code **tasks.service.spec.ts** like others
- Modify your code to pass **all of unit and e2e tests.**
- The execution code and test code are implemented, but please find the parts that are **missing from the API documentation** and update the API documentation as well.
- Change the authentication method, **use JWT** and it is **only valid for 10 minutes**,

  and change the **HTTP header name** from x-api-key to **xt-sol-api-key**,

  and update **all related documents and test codes**.

- Feel free to wrtie code on **tasks.service.spec.ts**
- Please feel free to write down any parts that you think could be added/modified from a **performance optimization** perspective.
- Feel free to refactor (Do the labelling on the commit message)

# ERD

![XT Solution!](/img/ERD4assinment.png 'XT Solutio')

# Assignment

This project based on **22.14.0 LTS of Node.js** and **11.7.0 version of MariaDB**.

## Prerequisites

Databases `nest_assignment_development`, `nest_assignment_production` and `nestjs_assignment_test` should be created in the MariaDB.

```sql
CREATE USER nestjs_assignment_development@localhost IDENTIFIED BY 'nestjs_assignment_development';
CREATE USER nestjs_assignment_production@localhost IDENTIFIED BY 'nestjs_assignment_production';
CREATE USER nestjs_assignment_test@localhost IDENTIFIED BY 'nestjs_assignment_test';
```

Don't forget to grant privileges to each users with 'localhost';

## Install dependencies

```bash
# npm
$ npm install

# yarn, pnpm, bun, etc.
$ <package-manager> install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn build
$ yarn start:prod
```

## Running tests

Testing generates a local SQLite database. The database location will be depended on the `TYPEORM_DATABASE` path in the `.env.test` file.

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```

## Extra

Each request checks for the `x-api-key` header. If the header is not included, or an invalid API key is given, a `403 Forbidden` status code will be returned. An active API key needs to be created to send any requests. You can create a new API key by connecting to the database and running the following SQL command:

```sql
-- development or production database
INSERT INTO api_key (id, is_active) VALUES (uuid(), true);
```

This will create a new active API key with a random UUID as its `key` column value. You can find the API key by running the following SQL command:

```sql
-- development or production database
SELECT * FROM api_key;
```

# Requests

When sending HTTP requests, either via Postman or any other tool, make sure to include the `x-api-key` header with any appropriate value. If the `x-api-key` header is not included, the server will respond with a `403 Forbidden` status code.

Example request:

```bash
curl --url "localhost:3000/users/email/example@email.com" \
     --header "x-api-key: ac70ca11-5d7f-4ca3-bede-fb1a06a36d28"
```

# Migrations

```bash
# Run migrations
$ yarn migration:run

# Revert migrations
$ yarn migration:revert
```

# Assignment applicantor

- Full name : Mac Minh Tung
- Email : macminhtung1993@gmail.com
