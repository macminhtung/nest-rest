import { TestApp } from '@test/utils/test-app';
import { HttpStatus } from '@nestjs/common';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserEntity } from '@/modules/user/user.entity';
import { CreateUserDto } from '@/modules/user/dtos';
import { CreateProjectDto, UpdateProjectDto } from '@/modules/project/dtos';
import { PaginatedResponseDto } from '@/common/dtos';

describe('Project endpoint', () => {
  let testApp: TestApp;
  let user: UserEntity;
  let project: ProjectEntity;

  beforeEach(async () => {
    testApp = await TestApp.create();
    const createUserPayload: CreateUserDto = {
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    };

    const resUser = await testApp
      .getRequest()
      .post('/users')
      .send(createUserPayload)
      .expect(HttpStatus.CREATED);

    const createProjectPayload: CreateProjectDto = {
      name: 'Test',
      description: 'Test',
    };
    const resProject = await testApp
      .getRequest()
      .post('/projects')
      .send(createProjectPayload)
      .expect(HttpStatus.CREATED);

    user = resUser.body;
    project = resProject.body;
  });

  afterEach(async () => {
    await testApp.close();
  });

  // #========================#
  // # ==> CREATE PROJECT <== #
  // #========================#
  it('/projects -> POST', async () => {
    const createProjectPayload: CreateProjectDto = {
      name: 'Test',
      description: 'Test',
    };
    return testApp
      .getRequest()
      .post('/projects')
      .send(createProjectPayload)
      .expect(HttpStatus.CREATED);
  });

  // #========================#
  // # ==> UPDATE PROJECT <== #
  // #========================#
  it('/projects/:projectId -> PATCH (Update project)', async () => {
    const updatePayload: UpdateProjectDto = { name: 'TEST' };
    return testApp
      .getRequest()
      .patch(`/projects/${project.id}`)
      .send(updatePayload)
      .expect(HttpStatus.OK)
      .then((res) => {
        const project: ProjectEntity = res.body;
        expect(project.name).toBe(updatePayload.name);
      });
  });

  it('/projects/:projectId -> PATCH (Invalid UUID)', async () => {
    const updatePayload: UpdateProjectDto = { name: 'TEST' };
    return testApp
      .getRequest()
      .patch('/projects/invalid-uuid')
      .send(updatePayload)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects/:projectId -> PATCH (Project not Found)', async () => {
    const updatePayload: UpdateProjectDto = { name: 'TEST' };
    return testApp
      .getRequest()
      .patch(`/projects/${testApp.testUUID}`)
      .send(updatePayload)
      .expect(HttpStatus.NOT_FOUND);
  });

  // #===========================#
  // # ==> GET PROJECT BY ID <== #
  // #===========================#
  it('/projects/:projectId -> GET', async () => {
    return testApp
      .getRequest()
      .get(`/projects/${project.id}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const updatedProject: ProjectEntity = res.body;
        expect(updatedProject).toEqual(project);
      });
  });

  it('/projects/:projectId -> GET (Invalid UUID)', async () => {
    return await testApp.getRequest().get('/projects/1').expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects/:projectId -> GET (Not Found)', async () => {
    return await testApp
      .getRequest()
      .get(`/projects/${testApp.testUUID}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  // #================================#
  // # ==> GET PAGINATED PROJECTS <== #
  // #================================#
  it('/projects?userId=:userId -> GET (Get the projects that user belong to)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return await testApp
      .getRequest()
      .get(`/projects?userId=${user.id}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const data: PaginatedResponseDto<ProjectEntity> = res.body;
        expect(data.total).toBe(1);
        expect(data.records?.[0]?.users?.[0]?.id).toBe(user.id);
      });
  });

  it('/projects?userId=:userId&name=:name -> GET (Invalid UUID)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return testApp
      .getRequest()
      .get(`/projects?userId=1&name=${project.name}`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects?name=:name&userId=:userId -> GET (Get project based on unexist userId ==> Response empty list)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return testApp
      .getRequest()
      .get(`/projects?name=${project.name}&userId=${testApp.testUUID}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const data: PaginatedResponseDto<ProjectEntity> = res.body;
        expect(data.total).toBe(0);
        expect(data.records).toEqual([]);
      });
  });

  it('/projects?name=:name&userId=:userId -> GET (Get project based on unexist name ==> Response empty list)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return testApp
      .getRequest()
      .get(`/projects?name=${testApp.testUUID}&userId=${user.id}`)
      .then((res) => {
        const data: PaginatedResponseDto<ProjectEntity> = res.body;
        expect(data.total).toBe(0);
        expect(data.records).toEqual([]);
      });
  });

  // #=============================#
  // # ==> ADD USER TO PROJECT <== #
  // #=============================#
  it('/projects/:projectId/users -> POST (Add the user to project)', async () => {
    return await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED)
      .then((res) => {
        const project: ProjectEntity = res.body;
        expect(project.users).toHaveLength(1);
        expect(project?.users?.[0].id).toEqual(user.id);
      });
  });

  it('/projects/:projectId/users -> POST (Add the user to project with invalid UUID)', async () => {
    return await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: 'invalid-uuid' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects/:projectId/users -> POST (Add the user nonexistent to project ==> User not found)', async () => {
    return await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: testApp.testUUID })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/projects/:projectId/users -> POST (Add the user to project nonexistent ==> Project not found)', async () => {
    return await testApp
      .getRequest()
      .post(`/projects/${testApp.testUUID}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/projects/:projectId/users -> POST (Add the already exist user to project ==> CONFLICT)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CONFLICT);
  });

  // #==================================#
  // # ==> REMOVE USER FROM PROJECT <== #
  // #==================================#
  it('/projects/:projectId/users -> DELETE (Remove user from project)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return await testApp
      .getRequest()
      .delete(`/projects/${project.id}/users/${user.id}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const project: ProjectEntity = res.body;
        expect(project.users).toHaveLength(0);
      });
  });

  it('/projects/:projectId/users -> DELETE (Remove user from project with invalid uuid)', async () => {
    await testApp
      .getRequest()
      .post(`/projects/${project.id}/users`)
      .send({ userId: user.id })
      .expect(HttpStatus.CREATED);

    return await testApp
      .getRequest()
      .delete(`/projects/invalid-uuid/users/invalid-uuid`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects/:projectId/users -> DELETE (Remove user nonexistent from project ==> User not found)', async () => {
    return await testApp
      .getRequest()
      .delete(`/projects/${project.id}/users/${testApp.testUUID}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/projects/:projectId/users -> DELETE (Remove user from project nonexistent ==> Project not found)', async () => {
    return await testApp
      .getRequest()
      .delete(`/projects/${testApp.testUUID}/users/${user.id}`)
      .expect(HttpStatus.NOT_FOUND);
  });

  // #==============================#
  // # ==> DELETE PROJECT BY ID <== #
  // #==============================#
  it('/projects/:projectId -> DELETE', async () => {
    await testApp.getRequest().delete(`/projects/${project.id}`).expect(HttpStatus.OK);
    await testApp.getRequest().get(`/projects/${project.id}`).expect(HttpStatus.NOT_FOUND);
  });

  it('/projects/:projectId -> DELETE (Invalid UUID)', async () => {
    await testApp.getRequest().delete('/projects/invalid-uuid').expect(HttpStatus.BAD_REQUEST);
  });

  it('/projects/:projectId -> DELETE (Project not Found)', async () => {
    await testApp.getRequest().delete(`/projects/${testApp.testUUID}`).expect(HttpStatus.NOT_FOUND);
  });
});
