module.exports = (sequelize, type) => {
    return sequelize.define('Films', {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: type.STRING,
            url: type.STRING
        },
        {
            freezeTableName: true,
            timestamps: false,
        })
}
