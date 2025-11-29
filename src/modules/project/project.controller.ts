import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '@/decorators';
import { ERoleName } from '@/common/enums';
import { ApiOkResponsePaginated, DeleteRecordResponseDto } from '@/common/dtos';
import { ProjectService } from '@/modules/project/project.service';
import { ProjectEntity } from '@/modules/project/project.entity';
import {
  CreateProjectDto,
  UpdateProjectDto,
  GetProjectsPaginatedDto,
  AddUserToProjectDto,
} from '@/modules/project/dtos';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // #========================#
  // # ==> CREATE PROJECT <== #
  // #========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: ProjectEntity })
  @Post()
  async createProject(@Body() payload: CreateProjectDto): Promise<ProjectEntity> {
    return this.projectService.createProject(payload);
  }

  // #========================#
  // # ==> UPDATE PROJECT <== #
  // #========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: ProjectEntity })
  @Patch(':id')
  async updateProject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateProjectDto,
  ): Promise<ProjectEntity> {
    return this.projectService.updateProject(id, body);
  }

  // #===========================#
  // # ==> GET PROJECT BY ID <== #
  // #===========================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: ProjectEntity })
  @Get(':id')
  async getProjectById(@Param('id', ParseUUIDPipe) id: string): Promise<ProjectEntity> {
    return this.projectService.getProjectById(id);
  }

  // #================================#
  // # ==> GET PAGINATED PROJECTS <== #
  // #================================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponsePaginated(ProjectEntity)
  @Get()
  getPaginatedUsers(@Query() queryParams: GetProjectsPaginatedDto) {
    return this.projectService.getPaginatedProjects(queryParams);
  }

  // #=============================#
  // # ==> ADD USER TO PROJECT <== #
  // #=============================#
  @Post(':projectId/users')
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: ProjectEntity })
  async addUserToProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: AddUserToProjectDto,
  ): Promise<ProjectEntity> {
    return this.projectService.addUserToProject(projectId, body.userId);
  }

  // #==================================#
  // # ==> REMOVE USER FROM PROJECT <== #
  // #==================================#
  @Delete(':projectId/users/:userId')
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: ProjectEntity })
  async removeUserFromProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<ProjectEntity> {
    return this.projectService.removeUserFromProject(projectId, userId);
  }

  // #==============================#
  // # ==> DELETE PROJECT BY ID <== #
  // #==============================#
  @Roles([ERoleName.ADMIN])
  @ApiOkResponse({ type: DeleteRecordResponseDto })
  @Delete('/:id')
  async deleteProjectById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeleteRecordResponseDto> {
    return this.projectService.deleteProjectById(id);
  }
}
