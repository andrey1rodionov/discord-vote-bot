const Sequelize = require('sequelize')
const FilmsModel = require('../models/Films')
const GenresModel = require('../models/Genres')
const FilmsGenresModel = require('../models/FilmsGenres')
const BirthdayModel = require('../models/Birthday')

const sequelize = new Sequelize('discord-vote-bot-db', 'root', '1111', {
    host: './DB/discord-vote-bot.sqlite',
    dialect: 'sqlite',
    logging: false
})

const Films = FilmsModel(sequelize, Sequelize)
const Genres = GenresModel(sequelize, Sequelize)
const FilmsGenres = FilmsGenresModel(sequelize, Sequelize)
const Birthday = BirthdayModel(sequelize, Sequelize)


Films.belongsToMany(Genres, {
    as: 'Genres',
    through: FilmsGenres,
    foreignKey: {
        name: 'FilmId',
        allowNull: false
    }
})

Genres.belongsToMany(Films, {
    as: 'Films',
    through: FilmsGenres,
    foreignKey: {
        name: 'GenreId',
        allowNull: false
    }
})

sequelize.sync().then(async () => {
    const genres = [
        {name: 'аниме'}, {name: 'биографический'}, {name: 'боевик'}, {name: 'вестерн'},
        {name: 'детектив'}, {name: 'детский'}, {name: 'документальный'}, {name: 'драма'},
        {name: 'исторический'}, {name: 'комедия'}, {name: 'криминал'}, {name: 'мелодрама'},
        {name: 'мистика'}, {name: 'музыка'}, {name: 'мультфильм'}, {name: 'мюзикл'},
        {name: 'научный'}, {name: 'приключения'}, {name: 'реалити-шоу'}, {name: 'семейный'},
        {name: 'спорт'}, {name: 'триллер'}, {name: 'ужасы'}, {name: 'фантастика'},
        {name: 'фэнтези'}
    ]

    for (let i = 0; i < genres.length; i++) {
        await Genres.findOrCreate({
            where: {
                id: i + 1,
                name: genres[i].name
            },
            defaults: {
                id: i + 1,
                name: genres[i].name
            }
        })
    }
})

module.exports = {
    Films,
    Genres,
    FilmsGenres,
    Birthday
}