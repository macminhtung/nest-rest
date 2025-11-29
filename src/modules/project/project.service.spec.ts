import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { config } from 'src/config/data-source.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { Project } from './project.entity';
import { ProjectsService } from './project.service';

describe('Projects service', () => {
  let projectsService: ProjectsService;
  let usersService: UsersService;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(config as DataSourceOptions),
        TypeOrmModule.forFeature([Project]),
        UsersModule,
        CommonModule,
      ],
      providers: [ProjectsService],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    await dataSource.synchronize(true);

    projectsService = module.get<ProjectsService>(ProjectsService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(projectsService).toBeDefined();
  });

  it('should create a new project', async () => {
    const project = await projectsService.createProject('test', 'test');

    expect(project).toBeDefined();
    expect(project.name).toEqual('test');
    expect(project.description).toEqual('test');
    expect(project.createdAt).toBeDefined();
    expect(project.updatedAt).toBeDefined();
    expect(project.users).toBeUndefined();
    expect(project.tasks).toBeUndefined();
  });

  it("should find a project given it's ID", async () => {
    const project = await projectsService.createProject('test', 'test');
    const foundProject = await projectsService.findById(project.id);

    expect(foundProject).toBeDefined();
    expect(foundProject.name).toEqual('test');
    expect(foundProject.description).toEqual('test');
    expect(foundProject.createdAt).toBeDefined();
    expect(foundProject.updatedAt).toBeDefined();
    expect(foundProject.users).toBeUndefined();
    expect(foundProject.tasks).toBeUndefined();
  });

  it('should add a user to a project', async () => {
    const project = await projectsService.createProject('test', 'test');
    const user = await usersService.createUser({
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    });

    await projectsService.addUser({ userId: user.id, projectId: project.id });
    const projectWithUser = await projectsService.findById(project.id, true);

    expect(projectWithUser.users).toHaveLength(1);
    expect(projectWithUser.users[0].firstName).toEqual('test');
    expect(projectWithUser.users[0].lastName).toEqual('test');
    expect(projectWithUser.users[0].email).toEqual('test@test.com');
    expect(projectWithUser.users[0].location).toEqual('test');
  });

  it("should throw if trying to add a user that doesn't exist, to project", async () => {
    const project = await projectsService.createProject('test', 'test');
    const user = await usersService.createUser({
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    });

    expect(projectsService.addUser({ userId: '1', projectId: project.id })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw if trying to add a user that's already in the project", async () => {
    const project = await projectsService.createProject('test', 'test');
    const user = await usersService.createUser({
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    });

    await projectsService.addUser({ userId: user.id, projectId: project.id });
    expect(projectsService.addUser({ userId: user.id, projectId: project.id })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should remove user from project', async () => {
    const project = await projectsService.createProject('test', 'test');
    const user = await usersService.createUser({
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    });

    await projectsService.addUser({ userId: user.id, projectId: project.id });
    await projectsService.removeUser({ userId: user.id, projectId: project.id });
    const projectWithUser = await projectsService.findById(project.id, true);

    expect(projectWithUser.users).toHaveLength(0);
  });

  it("should throw if trying to remove a user that doesn't exist, from project", async () => {
    const project = await projectsService.createProject('test', 'test');

    expect(projectsService.removeUser({ userId: '1', projectId: project.id })).rejects.toThrow(
      NotFoundException,
    );
  });

  it("should throw if trying to remove a user that's not in the project", async () => {
    const project = await projectsService.createProject('test', 'test');
    const user = await usersService.createUser({
      firstName: 'test',
      lastName: 'test',
      email: 'test@test.com',
      location: 'test',
    });

    expect(projectsService.removeUser({ userId: user.id, projectId: project.id })).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update an existing project', async () => {
    const project = await projectsService.createProject('test', 'test');

    const updatedProject = await projectsService.updateProject(project.id, {
      name: 'test2',
      description: 'test2',
    });

    expect(updatedProject).toBeDefined();
    expect(updatedProject.name).toEqual('test2');
    expect(updatedProject.description).toEqual('test2');
    expect(updatedProject.createdAt).toBeDefined();
    expect(updatedProject.updatedAt).toBeDefined();
    expect(updatedProject.users).toBeUndefined();
    expect(updatedProject.tasks).toBeUndefined();
  });

  it('should delete an existing project', async () => {
    const project = await projectsService.createProject('test', 'test');
    await projectsService.deleteProject(project.id);

    expect(projectsService.findById(project.id)).rejects.toThrow(NotFoundException);
  });

  it("should throw if trying to delete a project that doesn't exist", async () => {
    const project = await projectsService.createProject('test', 'test');
    await projectsService.deleteProject(project.id);

    expect(projectsService.deleteProject('1')).rejects.toThrow(NotFoundException);
    expect(projectsService.deleteProject(project.id)).rejects.toThrow(NotFoundException);
  });
});
