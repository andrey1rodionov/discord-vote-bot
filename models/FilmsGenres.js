module.exports = (sequelize) => {
    return sequelize.define('FilmsGenres', {},
        {
            freezeTableName: true,
            timestamps: false,
        })
}
