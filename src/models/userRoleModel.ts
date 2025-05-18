import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/dbConnection';
import User from './userModel';
import Role from './roleModel';

interface UserRoleAttributes {
  userId: number;
  roleId: number;
}

class UserRole extends Model<UserRoleAttributes> implements UserRoleAttributes {
  public userId!: number;
  public roleId!: number;
}

UserRole.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: 'id',
      },
      allowNull: false,
      primaryKey: true,
    },
    roleId: {
      type: DataTypes.INTEGER,
      references: {
        model: Role,
        key: 'id',
      },
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: 'user_roles',
    timestamps: false,
    sequelize,
  }
);

export default UserRole;
