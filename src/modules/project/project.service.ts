import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { v7 as uuidv7 } from 'uuid';
import { BaseService } from '@/common/base.service';
import { DeleteRecordResponseDto } from '@/common/dtos';
import { Repository } from 'typeorm';
import { ProjectEntity } from '@/modules/project/project.entity';
import { UserService } from '@/modules/user/user.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  GetProjectsPaginatedDto,
} from '@/modules/project/dtos';

@Injectable()
export class ProjectService extends BaseService<ProjectEntity> {
  constructor(
    @InjectRepository(ProjectEntity)
    public readonly repository: Repository<ProjectEntity>,

    private userService: UserService,
  ) {
    super(repository);
  }

  /**
   * Creates a new project and saves it to the database
   *
   * @param name - The name of the project
   * @param description - The project description
   * @returns Promise that resolves to the created Project entity
   */
  async createProject(payload: CreateProjectDto): Promise<ProjectEntity> {
    // Create a new project
    const newProject = await this.repository.save({ id: uuidv7(), ...payload });

    return newProject;
  }

  /**
   * Updates a specific project with the new given attributes
   *
   * @param projectId - The unique UUID of the project
   * @param attrs - Attributes of the Project entity to update
   * @returns Promise that resolves to the updated Project entity
   */
  async updateProject(projectId: string, attrs: UpdateProjectDto): Promise<ProjectEntity> {
    // Check the project already exists
    const existedProject = await this.checkExist({ where: { id: projectId } });

    // Update the project
    await this.repository.update(projectId, attrs);

    return { ...existedProject, ...attrs };
  }

  /**
   * Retrieves a project by its UUID from the database
   *
   * @param projectId - The unique id of the project
   * @returns Promise that resolves to the found Project entity
   * @throws {NotFoundException} - If no project is found with the given UUID
   */
  async getProjectById(projectId: string, loadUser = false): Promise<ProjectEntity> {
    // Check the project already exists
    const existedProject = await this.checkExist({
      where: { id: projectId },
      relations: { users: loadUser },
    });

    return existedProject;
  }

  /**
   * Retrieves a paginated list of users with optional filtering and search.
   * Supports filtering by userId, and keySearch (name).
   * @param queryParams Pagination and filter parameters
   * @returns Paginated result object
   */
  async getPaginatedProjects(queryParams: GetProjectsPaginatedDto) {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      const { userId, keySearch } = queryParams;
      const alias = this.entityName;

      qb.leftJoinAndSelect(`${alias}.users`, 'Us');

      // Filter based on userId
      if (userId) qb.andWhere(`Us.id = :userId`, { userId });

      // Filter the name based on keySearch
      if (keySearch)
        qb.andWhere(`${alias}.name ILIKE :keySearch`, {
          keySearch: `%${keySearch}`,
        });
    });

    return paginationData;
  }

  /**
   * Adds a user to a specific project
   *
   * @param projectId The unique UUID of the project
   * @param userId The unique UUID of the user
   * @returns Promise that resolves to the added Project entity
   * @throws {ConflictException} - If user is already added to the project
   */
  async addUserToProject(projectId: string, userId: string): Promise<ProjectEntity> {
    // Check the user already exists
    const existedUser = await this.userService.checkExist({ where: { id: userId } });

    // Check the project already exists
    const existedProject = await this.checkExist({
      where: { id: projectId },
      relations: { users: true },
    });

    // Prevent adding if the user already added to the project
    const { users = [] } = existedProject;
    if (users.find((i) => i.id === userId)) {
      throw new ConflictException({
        message: `The user has been added to the project`,
      });
    }

    // Add user to the project
    await this.repository
      .createQueryBuilder()
      .relation(ProjectEntity, 'users')
      .of(projectId)
      .add(userId);

    return { ...existedProject, users: [...users, existedUser] };
  }

  /**
   * Removes a user from a specific project
   *
   * @param projectId The unique UUID of the project
   * @param userId The unique UUID of the user
   * @returns Promise that resolves to the removed Project entity
   * @throws {BadRequestException} - If user isn't part of the project
   */
  async removeUserFromProject(projectId: string, userId: string): Promise<ProjectEntity> {
    // Check the user already exists
    await this.userService.checkExist({ where: { id: userId } });

    // Check the project already exists
    const existedProject = await this.checkExist({
      where: { id: projectId },
      relations: { users: true },
    });

    // Prevent adding if the user already added to the project
    const { users = [] } = existedProject;
    if (!users.find((i) => i.id === userId)) {
      throw new BadRequestException({
        message: `The user isn't part of the project`,
      });
    }

    // Remove user from the project
    await this.repository
      .createQueryBuilder()
      .relation(ProjectEntity, 'users')
      .of(projectId)
      .remove(userId);

    return { ...existedProject, users: users?.filter((i) => i.id !== userId) };
  }

  /**
   * Deletes a project by its UUID from the database
   *
   * @param projectId - The unique UUID of the project
   * @returns Promise that resolves to the DeleteStatus type
   */
  async deleteProjectById(projectId: string): Promise<DeleteRecordResponseDto> {
    // Check the project already exists
    await this.checkExist({ where: { id: projectId } });

    // Delete the project
    await this.repository.delete(projectId);

    return { deleted: true, message: 'Project deleted successfully' };
  }
}
