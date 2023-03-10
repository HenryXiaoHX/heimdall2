import {
  AllowNull,
  AutoIncrement,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  Model,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt
} from 'sequelize-typescript';
import {Evaluation} from '../evaluations/evaluation.model';
import {GroupEvaluation} from '../group-evaluations/group-evaluation.model';
import {GroupUser} from '../group-users/group-user.model';
import {User} from '../users/user.model';

@Table
export class Group extends Model {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.BIGINT)
  declare id: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  name!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  public!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  declare createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE)
  declare updatedAt: Date;

  @BelongsToMany(() => User, () => GroupUser)
  users!: Array<User & {GroupUser: GroupUser}>;

  @BelongsToMany(() => Evaluation, () => GroupEvaluation)
  evaluations!: Array<Evaluation & {GroupEvaluation: GroupEvaluation}>;
}
