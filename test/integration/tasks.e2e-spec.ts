import { TestApp } from '@test/utils/test-app';
import { HttpStatus } from '@nestjs/common';
import { ETaskStatus } from '@/common/enums';
import { PaginatedResponseDto } from '@/common/dtos';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserEntity } from '@/modules/user/user.entity';
import { TaskEntity } from '@/modules/task/task.entity';
import { CreateUserDto } from '@/modules/user/dtos';
import { CreateProjectDto } from '@/modules/project/dtos';
import { CreateTaskDto, UpdateTaskDto } from '@/modules/task/dtos';

describe('Tasks endpoint', () => {
  let testApp: TestApp;
  let user: UserEntity;
  let project: ProjectEntity;
  let task: TaskEntity;

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

    const createTaskPayload: CreateTaskDto = {
      name: 'test',
      description: 'test',
      status: ETaskStatus.TODO,
      userId: resUser.body.id,
      projectId: resProject.body.id,
    };
    const resTask = await testApp
      .getRequest()
      .post('/tasks')
      .send(createTaskPayload)
      .expect(HttpStatus.CREATED);

    user = resUser.body;
    project = resProject.body;
    task = resTask.body;
  });

  afterEach(async () => {
    await testApp.close();
  });

  // #=====================#
  // # ==> CREATE TASK <== #
  // #=====================#
  it('/tasks -> POST', async () => {
    const createPayload: CreateTaskDto = {
      name: 'test',
      description: 'test',
      status: ETaskStatus.TODO,
      userId: user.id,
      projectId: project.id,
    };
    return testApp.getRequest().post('/tasks').send(createPayload).expect(HttpStatus.CREATED);
  });

  it('/tasks -> POST (Invalid UUIDs)', async () => {
    const createPayload: CreateTaskDto = {
      name: 'test',
      description: 'test',
      status: ETaskStatus.TODO,
      userId: 'invalid-uuid',
      projectId: 'invalid-uuid',
    };
    return testApp.getRequest().post('/tasks').send(createPayload).expect(HttpStatus.BAD_REQUEST);
  });

  it('/tasks -> POST (User not Found)', async () => {
    const createPayload: CreateTaskDto = {
      name: 'test',
      description: 'test',
      status: ETaskStatus.TODO,
      userId: testApp.testUUID,
      projectId: project.id,
    };

    return testApp.getRequest().post('/tasks').send(createPayload).expect(HttpStatus.NOT_FOUND);
  });

  it('/tasks -> POST (Project not Found)', async () => {
    const createPayload: CreateTaskDto = {
      name: 'test',
      description: 'test',
      status: ETaskStatus.TODO,
      userId: user.id,
      projectId: testApp.testUUID,
    };

    return testApp.getRequest().post('/tasks').send(createPayload).expect(HttpStatus.NOT_FOUND);
  });

  // #=====================#
  // # ==> UPDATE TASK <== #
  // #=====================#
  it('/tasks/:taskId -> PATCH', async () => {
    const updatePayload: UpdateTaskDto = { status: ETaskStatus.DONE };

    await testApp
      .getRequest()
      .patch(`/tasks/${task.id}`)
      .send(updatePayload)
      .expect(HttpStatus.OK)
      .then((res) => {
        expect(res.body.status).toBe(updatePayload.status);
      });
  });

  it('/tasks/:taskId -> PATCH (Invalid UUID)', async () => {
    await testApp
      .getRequest()
      .patch('/tasks/invalid-uuid')
      .send({ status: ETaskStatus.DONE })
      .expect(400);
  });

  it('/tasks/:taskId -> PATCH (Task not Found)', async () => {
    await testApp
      .getRequest()
      .patch(`/tasks/${testApp.testUUID}`)
      .send({ status: ETaskStatus.DONE })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/tasks/:taskId -> PATCH (Invalid user UUID)', async () => {
    await testApp
      .getRequest()
      .patch(`/tasks/${task.id}`)
      .send({ userId: 'invalid-uuid' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/tasks/:taskId -> PATCH (User not Found)', async () => {
    await testApp
      .getRequest()
      .patch(`/tasks/${task.id}`)
      .send({ userId: testApp.testUUID })
      .expect(HttpStatus.NOT_FOUND);
  });

  it('/tasks/:taskId -> PATCH (Invalid project UUID)', async () => {
    await testApp
      .getRequest()
      .patch(`/tasks/${task.id}`)
      .send({ projectId: 'invalid-uuid' })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('/tasks/:taskId -> PATCH (Project not Found)', async () => {
    await testApp
      .getRequest()
      .patch(`/tasks/${task.id}`)
      .send({ projectId: testApp.testUUID })
      .expect(HttpStatus.NOT_FOUND);
  });

  // #========================#
  // # ==> GET TASK BY ID <== #
  // #========================#
  it('/tasks/:taskId -> GET', async () => {
    return testApp
      .getRequest()
      .get(`/tasks/${task.id}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const existedTask: TaskEntity = res.body;
        expect(existedTask).toEqual(task);
      });
  });

  it('/tasks/:taskId -> GET (Invalid UUID)', async () => {
    return testApp.getRequest().get('/tasks/invalid-uuid').expect(HttpStatus.BAD_REQUEST);
  });

  it('/tasks/:taskId -> GET (User not Found)', async () => {
    return testApp.getRequest().get(`/tasks/${testApp.testUUID}`).expect(HttpStatus.NOT_FOUND);
  });

  // #=============================#
  // # ==> GET PAGINATED TASKS <== #
  // #=============================#
  it('/tasks/user/:userId?status=TODO -> GET', async () => {
    const createTaskPayload1: CreateTaskDto = {
      name: 'test 1',
      description: 'test 1',
      status: ETaskStatus.TODO,
      userId: user.id,
      projectId: project.id,
    };
    await testApp.getRequest().post('/tasks').send(createTaskPayload1).expect(HttpStatus.CREATED);

    const createTaskPayload2: CreateTaskDto = {
      name: 'test 2',
      description: 'test 2',
      status: ETaskStatus.TODO,
      userId: user.id,
      projectId: project.id,
    };
    await testApp.getRequest().post('/tasks').send(createTaskPayload2).expect(HttpStatus.CREATED);

    return testApp
      .getRequest()
      .get(`/tasks?userId=${user.id}&status=${ETaskStatus.TODO}`)
      .expect(200)
      .then((res) => {
        const data: PaginatedResponseDto<TaskEntity> = res.body;
        expect(data.total).toBe(3);
        expect(data.records.length).toBe(3);
      });
  });

  it('/tasks?userId=userId&status=DOING -> GET (Invalid UUID)', async () => {
    return testApp
      .getRequest()
      .get(`/tasks?userId=invalid-uuid&status=${ETaskStatus.DOING}`)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`/tasks/user?userId=userId&status=DONE -> GET (Response empty list )`, async () => {
    return testApp
      .getRequest()
      .get(`/tasks?userId=${testApp.testUUID}&status=${ETaskStatus.DONE}`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const data: PaginatedResponseDto<TaskEntity> = res.body;
        expect(data.total).toBe(0);
        expect(data.records.length).toBe(0);
      });
  });

  it('/tasks?userId:userId&status=TODO&page=3&take=1 -> GET', async () => {
    const createTaskPayload1: CreateTaskDto = {
      name: 'test 1',
      description: 'test 1',
      status: ETaskStatus.TODO,
      userId: user.id,
      projectId: project.id,
    };
    await testApp.getRequest().post('/tasks').send(createTaskPayload1).expect(HttpStatus.CREATED);

    const createTaskPayload2: CreateTaskDto = {
      name: 'test 2',
      description: 'test 2',
      status: ETaskStatus.TODO,
      userId: user.id,
      projectId: project.id,
    };
    await testApp.getRequest().post('/tasks').send(createTaskPayload2).expect(HttpStatus.CREATED);

    return testApp
      .getRequest()
      .get(`/tasks?userId=${user.id}&status=TODO&page=3&take=1`)
      .expect(HttpStatus.OK)
      .then((res) => {
        const data: PaginatedResponseDto<TaskEntity> = res.body;
        expect(data.records).toHaveLength(1);
        expect(data.records[0].name).toBe(task.name); // Ordered by creation date (newest first)
      });
  });

  // #===========================#
  // # ==> DELETE TASK BY ID <== #
  // #===========================#
  it('/tasks/:taskId -> DELETE', async () => {
    await testApp.getRequest().delete(`/tasks/${task.id}`).expect(HttpStatus.OK);
    await testApp.getRequest().get(`/tasks/${task.id}`).expect(HttpStatus.NOT_FOUND);
  });

  it('/tasks/:taskId -> DELETE (Invalid UUID)', async () => {
    await testApp.getRequest().delete('/tasks/invalid-uuid').expect(HttpStatus.BAD_REQUEST);
  });

  it('/tasks/:taskId -> DELETE (Task not Found)', async () => {
    await testApp.getRequest().delete(`/tasks/${testApp.testUUID}`).expect(HttpStatus.NOT_FOUND);
  });
});
