module.exports = function(Sequelize,DataTypes){
  return Sequelize.define('t_rooms',{
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    config_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    room_create_user_id: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    is_end: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
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
    },
    token_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    room_name: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    zj_type: {
      type: DataTypes.STRING(2),
      allowNull: false,
      defaultValue: 'fz'
    },
  },{
    createdAt:'create_time',
    updatedAt:'update_time',
    freezeTableName: true
  });
}
