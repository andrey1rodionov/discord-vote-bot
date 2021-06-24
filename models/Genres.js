module.exports = (sequelize, type) => {
    return sequelize.define('Genres', {
            id: {
                type: type.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: type.STRING
        },
        {
            freezeTableName: true,
            timestamps: false,
        })
}
