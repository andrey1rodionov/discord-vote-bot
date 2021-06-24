module.exports = (sequelize, type) => {
    return sequelize.define('Birthday', {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            UserTag: type.STRING,
            UserBirthday: type.DATEONLY
        },
        {
            freezeTableName: true,
            timestamps: false,
        })
}