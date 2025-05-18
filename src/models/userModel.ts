import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/dbConnection';
import Joi from '@hapi/joi';
import jwt from 'jsonwebtoken';
import Role from './roleModel';
import UserRole from './userRoleModel';

// Kullanıcı özellikleri
export interface UserAttributes {
  createdAt: any;
  updatedAt: any;
  id: number;
  isim: string;
  userName: string;
  email: string;
  sifre: string;
  isActive: boolean;
  email_active: boolean;
}

// Yeni kullanıcı yaratırken id, isActive ve email_active opsiyonel
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'email_active'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public isim!: string;
  public userName!: string;
  public email!: string;
  public sifre!: string;
  public isActive!: boolean;
  public email_active!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Sequelize association methodları
  public getRoles!: () => Promise<Role[]>;
  public addRole!: (role: Role) => Promise<void>;

  // Instance method: JWT token oluşturma
  public async generateToken(): Promise<string> {
    const roles = await this.getRoles();
    const token = jwt.sign(
      { _id: this.id, roles: roles.map((role: Role) => role.name) },
      "secretkey", // Çevresel değişkene taşınmalı
      { expiresIn: "2h" }
    );
    return token;
  }

  // Instance method: Joi validation
  public joiValidation(userObject: Partial<UserAttributes>) {
    return schema.validate(userObject);
  }

  // Static method: Joi validation for update
  public static joiValidationForUpdate(userObject: Partial<UserAttributes>) {
    return schema.validate(userObject);
  }
}

// Joi validation şeması
const schema = Joi.object({
  isim: Joi.string().min(3).max(50).required(),
  userName: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  sifre: Joi.string().required(),
  isActive: Joi.boolean(),
  email_active: Joi.boolean(),
});

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    isim: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 50],
      },
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    sifre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    email_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: '',
    updatedAt: ''
  },
  {
    tableName: 'users',
    timestamps: true,
    sequelize,
  }
);

// İlişki tanımlama
User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

// UserInstance tipini modelden türet
export type UserInstance = InstanceType<typeof User>;

export default User;