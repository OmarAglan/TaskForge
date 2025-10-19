const { Model, DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  class Task extends Model {
    static associate(models) {
      // Define associations here
      Task.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })
      
      Task.belongsTo(models.Project, {
        foreignKey: 'projectId',
        as: 'project'
      })
    }
  }

  Task.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
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
    status: {
      type: DataTypes.ENUM('todo', 'in_progress', 'completed', 'blocked'),
      allowNull: false,
      defaultValue: 'todo'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Task',
    tableName: 'Tasks',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['projectId']
      },
      {
        fields: ['status']
      },
      {
        fields: ['dueDate']
      }
    ]
  })

  return Task
}