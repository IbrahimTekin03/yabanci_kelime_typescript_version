import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db/dbConnection';

// Role modelinin sahip olduğu özelliklerin tipi
interface RoleAttributes {
  id: number;
  name: string;
}

// Yeni Role oluştururken id opsiyonel olur (autoIncrement olduğu için)
interface RoleCreationAttributes extends Optional<RoleAttributes, 'id'> {}

// Model sınıfını tanımlıyoruz
class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: number;
  public name!: string;
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'roles',
    timestamps: false,
    sequelize, // bağlantıyı veriyoruz
  }
);

export default Role;
