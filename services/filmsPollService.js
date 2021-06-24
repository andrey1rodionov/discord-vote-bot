const sequelize = require('../DB/database')
const Sequelize = require('sequelize')

const Genres = sequelize.Genres
const FilmsGenres = sequelize.FilmsGenres
const Films = sequelize.Films

const createFilmsPoll = function (emoji, config, Discord, client, channel, nameOfGenreWinner, endFilmsPollTime) {
    const pollFilm = []
    let nameOfFilmWinner = ''
    getAllFilms(nameOfGenreWinner).then(result => {
        let choiceFilmsList = ''
        let percentFilmsList = ''
        let FilmsUrlList = ''
        for (let i = 0; i < result.length; i++) {
            choiceFilmsList += `${emoji.filmsLetters[i]} - ${result[i]['name']}\n`
            FilmsUrlList += `${result[i].url}\n`
            percentFilmsList += `0.0 %\n`
            pollFilm.push({
                emoji: emoji.filmsLetters[i],
                film: result[i]['name'],
                url: result[i]['url'],
                vote: 0
            })
        }

        const embed = new Discord.MessageEmbed()
            .setTitle(`Голосование за фильм по жанру ${nameOfGenreWinner}`)
            .setColor(config.color)
            .setDescription('Выберите наиболее понравившийся вам фильм\nМожно выбирать несколько')
            .setAuthor(config.appName)
            .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
            .addFields([{
                name: 'Дата окончания голосования (МСК)',
                value: endFilmsPollTime
            }, {
                name: 'Фильмы:',
                value: choiceFilmsList,
                inline: true
            }, {
                name: 'Описание:',
                value: FilmsUrlList,
                inline: true
            }, {
                name: '%:',
                value: percentFilmsList,
                inline: true
            }])

        channel.send(embed)
            .then(function (message) {
                for (let i = 0; i < result.length; i++) {
                    message.react(emoji.filmsLetters[i])
                }

                const filter = (reaction, user) => {
                    return emoji.filmsLetters.includes(reaction.emoji.name) && user.id !== message.author.id
                }

                const collector = message.createReactionCollector(filter, {
                    time: config.pollTime,
                    errors: ['time'],
                    dispose: true
                })

                collector.on('collect', (reaction) => {
                    percentFilmsList = ''
                    for (let index in pollFilm) {
                        if (pollFilm[index].emoji === reaction.emoji.name) {
                            pollFilm[index].vote++
                            break
                        }
                    }

                    for (let index in pollFilm) {
                        let sumVote = 0
                        for (let index in pollFilm) {
                            sumVote += pollFilm[index].vote
                        }
                        percentFilmsList += `${(pollFilm[index].vote * 100 / sumVote).toFixed(1)} %\n`
                    }

                    const embed = new Discord.MessageEmbed()
                        .setTitle(`Голосование за фильм по жанру ${nameOfGenreWinner}`)
                        .setColor(config.color)
                        .setDescription('Выберите наиболее понравившийся вам фильм\nМожно выбирать несколько')
                        .setAuthor(config.appName)
                        .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
                        .addFields([{
                            name: 'Дата окончания голосования (МСК)',
                            value: endFilmsPollTime
                        }, {
                            name: 'Фильмы:',
                            value: choiceFilmsList,
                            inline: true
                        }, {
                            name: 'Описание:',
                            value: FilmsUrlList,
                            inline: true
                        }, {
                            name: '%:',
                            value: percentFilmsList,
                            inline: true
                        }])

                    if (pollFilm.map(film => film.vote >= 0)) {
                        setTimeout(function () {
                            message.edit(embed)
                        }, 500)
                    }
                })

                collector.on('remove', (reaction) => {
                    percentFilmsList = ''
                    for (let index in pollFilm) {
                        if (pollFilm[index].emoji === reaction.emoji.name) {
                            pollFilm[index].vote--
                            break
                        }
                    }

                    for (let index in pollFilm) {
                        let sumVote = 0
                        for (let index in pollFilm) {
                            sumVote += pollFilm[index].vote
                        }
                        if (sumVote !== 0) {
                            percentFilmsList += `${(pollFilm[index].vote * 100 / sumVote).toFixed(1)} %\n`
                        } else {
                            percentFilmsList += `0.0 %\n`
                        }
                    }

                    const embed = new Discord.MessageEmbed()
                        .setTitle(`Голосование за фильм по жанру ${nameOfGenreWinner}`)
                        .setColor(config.color)
                        .setDescription('Выберите наиболее понравившийся вам фильм\nМожно выбирать несколько')
                        .setAuthor(config.appName)
                        .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
                        .addFields([{
                            name: 'Дата окончания голосования (МСК)',
                            value: endFilmsPollTime
                        }, {
                            name: 'Фильмы:',
                            value: choiceFilmsList,
                            inline: true
                        }, {
                            name: 'Описание:',
                            value: FilmsUrlList,
                            inline: true
                        }, {
                            name: '%:',
                            value: percentFilmsList,
                            inline: true
                        }])

                    if (pollFilm.map(film => film.vote >= 0)) {
                        setTimeout(function () {
                            message.edit(embed)
                        }, 500)
                    }
                })

                collector.on('end', () => {
                    let max = 0
                    pollFilm.forEach(result => {
                        if (result.vote > max) {
                            max = result.vote
                        }
                    })
                    nameOfFilmWinner = pollFilm.find(obj => obj.vote === max).film
                    const embed = new Discord.MessageEmbed()
                        .setTitle('Результат голосования')
                        .setColor(config.color)
                        .setAuthor(config.appName)
                        .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
                        .addFields([{
                            name: 'Наибольшее количество голосов набрал фильм:',
                            value: nameOfFilmWinner
                        }])

                    channel.send(embed)
                })
            })
    })
}

const getAllFilms = async (winnerName) => {
    const arrayOfFilmsId = []
    const filmsInformation = []
    let genreId = 0

    const genres = await Genres.findAll({where: {name: winnerName}})

    for (const genreObj of genres) {
        genreId = genreObj['id']
    }

    const filmsGenres = await FilmsGenres.findAll({where: {GenreId: genreId}})

    for (const filmGenreObj of filmsGenres) {
        arrayOfFilmsId.push(filmGenreObj['FilmId'])
    }

    const films = await Films.findAll({
        where: {id: arrayOfFilmsId},
        order: Sequelize.literal('random()'),
        limit: 10
    })

    for (const filmObj of films) {
        filmsInformation.push({
            name: filmObj['name'],
            url: filmObj['url']
        })
    }

    return filmsInformation
}

module.exports = {createFilmsPoll: createFilmsPoll}