const sequelize = require('../DB/database')
const Sequelize = require('sequelize')
const filmsPollService = require('../services/filmsPollService')
const moment = require('moment-timezone')

const Genres = sequelize.Genres

moment.locale('ru')

const createGenresPoll = function (emoji, config, Discord, client, endGenresPollTime) {
    const channel = client.channels.cache.find(channel => channel.id === config.pollChannel)
    const pollGenre = []
    let nameOfGenreWinner = ''
    getAllGenres().then(result => {
        let choiceGenresList = ''
        let percentGenresList = ''
        for (let i = 0; i < 10; i++) {
            choiceGenresList += `${emoji.genresLetters[i]} - ${result[i]}\n`
            percentGenresList += `0.0 %\n`
            pollGenre.push({emoji: emoji.genresLetters[i], genre: result[i], vote: 0})
        }
        const embed = new Discord.MessageEmbed()
            .setTitle('Голосование за жанр')
            .setColor(config.color)
            .setDescription('Выберите наиболее понравившийся вам жанр\nМожно выбирать несколько')
            .setAuthor(config.appName)
            .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
            .addFields([{
                name: 'Дата окончания голосования (МСК)',
                value: endGenresPollTime
            }, {
                name: 'Жанры:',
                value: choiceGenresList,
                inline: true
            }, {
                name: '%:',
                value: percentGenresList,
                inline: true
            }])

        channel.send(embed)
            .then(function (message) {
                for (let i = 0; i < 10; i++) {
                    message.react(emoji.genresLetters[i])
                }

                const filter = (reaction, user) => {
                    return emoji.genresLetters.includes(reaction.emoji.name) && user.id !== message.author.id
                }

                const collector = message.createReactionCollector(filter, {
                    time: config.pollTime,
                    errors: ['time'],
                    dispose: true
                })

                collector.on('collect', (reaction) => {
                    percentGenresList = ''
                    for (let index in pollGenre) {
                        if (pollGenre[index].emoji === reaction.emoji.name) {
                            pollGenre[index].vote++
                            break
                        }
                    }

                    for (let index in pollGenre) {
                        let sumVote = 0
                        for (let index in pollGenre) {
                            sumVote += pollGenre[index].vote
                        }
                        percentGenresList += `${(pollGenre[index].vote * 100 / sumVote).toFixed(1)} %\n`
                    }

                    const embed = new Discord.MessageEmbed()
                        .setTitle('Голосование за жанр')
                        .setColor(config.color)
                        .setDescription('Выберите наиболее понравившийся вам жанр\nМожно выбирать несколько')
                        .setAuthor(config.appName)
                        .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
                        .addFields([{
                            name: 'Дата окончания голосования (МСК)',
                            value: endGenresPollTime
                        }, {
                            name: 'Жанры:',
                            value: choiceGenresList,
                            inline: true
                        }, {
                            name: '%:',
                            value: percentGenresList,
                            inline: true
                        }])

                    if (pollGenre.map(genre => genre.vote >= 0)) {
                        setTimeout(function () {
                            message.edit(embed)
                        }, 500)
                    }
                })

                collector.on('remove', (reaction) => {
                    percentGenresList = ''
                    for (let index in pollGenre) {
                        if (pollGenre[index].emoji === reaction.emoji.name) {
                            pollGenre[index].vote--
                            break
                        }
                    }

                    for (let index in pollGenre) {
                        let sumVote = 0
                        for (let index in pollGenre) {
                            sumVote += pollGenre[index].vote
                        }
                        if (sumVote !== 0) {
                            percentGenresList += `${(pollGenre[index].vote * 100 / sumVote).toFixed(1)} %\n`
                        } else {
                            percentGenresList += `0.0 %\n`
                        }
                    }

                    const embed = new Discord.MessageEmbed()
                        .setTitle('Голосование за жанр')
                        .setColor(config.color)
                        .setDescription('Выберите наиболее понравившийся вам жанр\nМожно выбирать несколько')
                        .setAuthor(config.appName)
                        .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
                        .addFields([{
                            name: 'Дата окончания голосования (МСК)',
                            value: endGenresPollTime
                        }, {
                            name: 'Жанры:',
                            value: choiceGenresList,
                            inline: true
                        }, {
                            name: '%:',
                            value: percentGenresList,
                            inline: true
                        }])

                    if (pollGenre.map(genre => genre.vote >= 0)) {
                        setTimeout(function () {
                            message.edit(embed)
                        }, 500)
                    }
                })

                collector.on('end', () => {
                    let max = 0
                    pollGenre.forEach(result => {
                        if (result.vote > max) {
                            max = result.vote
                        }
                    })
                    nameOfGenreWinner = pollGenre.find(obj => obj.vote === max).genre
                    const embed = new Discord.MessageEmbed()
                        .setTitle('Результат голосования')
                        .setColor(config.color)
                        .setAuthor(config.appName)
                        .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
                        .addFields([{
                            name: 'Наибольшее количество голосов набрал жанр:',
                            value: nameOfGenreWinner
                        }])

                    channel.send(embed)

                    let endFilmsPollTime = moment(endGenresPollTime).tz('Europe/Moscow').add(config.pollTime, 'ms').format('LLL')

                    filmsPollService.createFilmsPoll(emoji, config, Discord, client, channel, nameOfGenreWinner, endFilmsPollTime)
                })
            })
    })
}

const getAllGenres = async () => {
    const arrayOfGenres = []
    const genres = await Genres.findAll({
        attributes: ['name'],
        raw: true,
        order: Sequelize.literal('random()'),
        limit: 10
    })

    for (const genreObj of genres) {
        arrayOfGenres.push(genreObj['name'])
    }

    return arrayOfGenres
}

module.exports = {createGenresPoll: createGenresPoll}