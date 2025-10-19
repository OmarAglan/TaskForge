const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class Project extends Model {
    static associate(models) {
      // Define associations here
      Project.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })
      
      Project.hasMany(models.Task, {
        foreignKey: 'projectId',
        as: 'tasks'
      })
    }
  }

  Project.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: true,
      defaultValue: '#3498db',
      validate: {
        is: /^#[0-9A-F]{6}$/i // Hex color format validation
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Project',
    tableName: 'Projects',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['name']
      }
    ]
  })

  return Project
}