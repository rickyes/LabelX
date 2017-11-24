module.exports = function(Sequelize,DataTypes){
  return Sequelize.define('t_room_users',{
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    seat: {
      type: DataTypes.INTEGER(3),
      allowNull:  false
    },
    room_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: 'uk_t_room_users'
    },
    role: {
      type: DataTypes.STRING(11),
      allowNull: false
    },
    user_id: {
      type: DataTypes.BIGINT(20),
      allowNull: false,
      unique: 'uk_t_room_users'
    },
    is_room: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    deduct: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    sit_down: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 0
    },
    create_time: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
      allowNull: false
    },
    update_time: {
      type: DataTypes.DATE,
      defaultValue: Date.now(),
      allowNull: false
    }
  },{
    createdAt:'create_time',
    updatedAt:'update_time',
    freezeTableName: true
  });
}
