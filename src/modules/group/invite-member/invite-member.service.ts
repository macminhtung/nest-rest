import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { BaseService } from '@/common/base.service';
import { TRequest } from '@/common/types';
import {
  InviteMemberEntity,
  EInviteMemberStatus,
} from '@/modules/group/invite-member/invite-member.entity';
import {
  CreateInviteMemberDto,
  ManageInviteMemberStatusDto,
  GetInviteMembersPaginatedDto,
} from '@/modules/group/invite-member/dtos';
import { PaginatedResponseDto } from '@/common/dtos';

@Injectable()
export class InviteMemberService extends BaseService<InviteMemberEntity> {
  constructor(
    @InjectRepository(InviteMemberEntity)
    public readonly repository: EntityRepository<InviteMemberEntity>,
  ) {
    super(repository);
  }

  // #==============================#
  // # ==> CREATE INVITE MEMBER <== #
  // #==============================#
  async createInviteMember(
    req: TRequest,
    payload: CreateInviteMemberDto,
  ): Promise<InviteMemberEntity> {
    const { id: authId } = req.authUser;
    const { groupId, memberId } = payload;

    // Prevent creating if the group's name already exists
    await this.checkExist({ filter: { groupId, group: { ownerId: authId } } });

    // Prevent creating if the group's name already exists
    await this.checkConflict({ filter: { groupId, memberId } });

    // Create new invite-member
    const newInviteMember = await this.create({ entityData: { groupId, memberId } });

    return newInviteMember;
  }

  // #=====================================#
  // # ==> MANAGE INVITE MEMBER STATUS <== #
  // #=====================================#
  async manageInviteMemberStatus(
    req: TRequest,
    inviteMemberId: string,
    payload: ManageInviteMemberStatusDto,
  ): Promise<InviteMemberEntity> {
    const { id: authId } = req.authUser;
    const { status, isPreventReinvite } = payload;

    // Prevent creating if the group's name already exists
    const existedInviteMember = await this.checkExist({
      filter: { id: inviteMemberId, memberId: authId, status: EInviteMemberStatus.REQUESTING },
    });

    // Update invite-member status
    await this.update({
      filter: { id: inviteMemberId },
      entityData: { status, isPreventReinvite },
    });

    return { ...existedInviteMember, ...payload };
  }

  // #======================================#
  // # ==> GET PAGINATED INVITE MEMBERS <== #
  // #======================================#
  async getPaginatedInviteMembers(
    queryParams: GetInviteMembersPaginatedDto,
  ): Promise<PaginatedResponseDto<InviteMemberEntity>> {
    const paginationData = await this.getPaginatedRecords(queryParams, (qb) => {
      qb.where({ groupId: queryParams.groupId });
    });

    return paginationData;
  }
}
