module.exports = function(Sequelize,DataTypes){
  return Sequelize.define('t_room_configs',{
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'xzdd'
    },
    piece: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 4
    },
    bottom_score: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    fan: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 4
    },
    zj_type: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'fz'
    },
    laizi: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: 9
    },
    create_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now()
    },
    update_time: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now()
    }
  },{
    createdAt: 'create_time',
    updatedAt: 'update_time',
    freezeTableName: true
  });
}
