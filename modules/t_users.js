module.exports = function(Sequelize,DataTypes){
  return Sequelize.define('t_users',{
    userid: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(64),
      defaultValue: '',
      allowNull: true,
    },
    exp: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    gems: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    gold: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    winrate: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    all_game: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    address: {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: ''
    },
    score: {
      type: DataTypes.INTEGER(32),
      allowNull: false,
      defaultValue: 0
    },
    ip: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: ''
    },
    headimg: {
      type: DataTypes.STRING(128),
      allowNull: false,
      defaultValue: ''
    },
    sex: {
      type: DataTypes.STRING(8),
      defaultValue: '',
      allowNull: false
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
