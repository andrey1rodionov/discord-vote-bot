const Discord = require('discord.js')
const client = new Discord.Client()
const genresPollService = require('./services/genresPollService')
const sequelize = require('./DB/database')
const Sequelize = require('sequelize')
const moment = require('moment')
const shortUrl = require('node-url-shortener');

const Genres = sequelize.Genres
const FilmsGenres = sequelize.FilmsGenres
const Films = sequelize.Films
const Birthday = sequelize.Birthday

moment.locale('ru')

const emoji = {
    genresLetters: ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯'],
    filmsLetters: ['🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹']
}

const config = {
    color: '#DC143C',
    appName: 'Harbingers Bot',
    pollTime: 20 * 1000,
    mainChannel: '856202356135297044',
    // adminChannel: '856202356135297044',
    // pollChannel: '846868776259551287',
    // guildID: '846868776259551282'
    adminChannel: '857567697838407701',
    pollChannel: '857566737233739796',
    guildID: '598316717130907648'
}

client.on('ready', async () => {
    await client.user.setActivity('Фильмы', {type: 'WATCHING'})

    await createAppCommand({
        name: 'poll',
        description: 'Начать голосование',
        options: [{
            name: 'время',
            description: 'Время голосования (часы)',
            type: 4,
            required: true
        }],
    }, config.guildID)

    await createAppCommand({
        name: 'create-film',
        description: 'Добавить новый фильм',
        options: [{
            name: 'название',
            description: 'Название фильма',
            type: 3,
            required: true
        }, {
            name: 'ссылка',
            description: 'Ссылка на ресурс с описанием фильма',
            type: 3,
            required: true
        }, {
            name: 'жанр-1',
            description: 'Жанр #1 (обязательный)',
            type: 4,
            required: true,
            choices: await getAllGenres()
        }, {
            name: 'жанр-2',
            description: 'Жанр #2 (необязательный)',
            type: 4,
            choices: await getAllGenres()
        }, {
            name: 'жанр-3',
            description: 'Жанр #3 (необязательный)',
            type: 4,
            choices: await getAllGenres()
        }]
    }, config.guildID)

    await createAppCommand({
        name: 'delete-film',
        description: 'Удалить фильм',
        options: [{
            name: 'id',
            description: 'ID фильма',
            type: 4,
            required: true
        }]
    }, config.guildID)

    await createAppCommand({
        name: 'show-all-films',
        description: 'Вывести список всех фильмов',
    }, config.guildID)

    await createAppCommand({
        name: 'add-birthday',
        description: 'Добавить день рождения пользователя',
        options: [{
            name: 'пользователь',
            description: 'Тег пользователя',
            type: 6,
            required: true
        }, {
            name: 'дата-рождения',
            description: 'Дата рождения. Пример: 21.11.2021',
            type: 3,
            required: true
        }]
    }, config.guildID)
})

client.ws.on('INTERACTION_CREATE', async interaction => {
    if (interaction.channel_id === config.adminChannel) {
        let command = interaction.data.name.toLowerCase()
        if (command === 'poll') {
            try {
                config.pollTime = interaction.data.options[0].value * 3600000
                let endGenresPollTime = moment().add(config.pollTime, 'ms').format('LLL')
                genresPollService.createGenresPoll(emoji, config, Discord, client, endGenresPollTime)
                await sendReplyMessage(`Голосование началось! Закончится ${endGenresPollTime}`, interaction)
            } catch (e) {
                await sendReplyMessage('Что-то пошло не так. Попробуйте еще раз!', interaction)
            }
        } else if (command === 'create-film') {
            try {
                const arrayOfGenres = []
                let filmName
                let url
                for (let i = 0; i < interaction.data.options.length; i++) {
                    if (interaction.data.options[i].name === 'название') {
                        filmName = interaction.data.options[i].value
                    } else if (interaction.data.options[i].name === 'ссылка') {
                        url = interaction.data.options[i].value
                    } else if (interaction.data.options[i].name === 'жанр-1') {
                        arrayOfGenres.push(interaction.data.options[i].value)
                    } else if (interaction.data.options[i].name === 'жанр-2') {
                        arrayOfGenres.push(interaction.data.options[i].value)
                    } else if (interaction.data.options[i].name === 'жанр-3') {
                        arrayOfGenres.push(interaction.data.options[i].value)
                    }
                }

                shortUrl.short(url, (err, url) => {
                    try {
                        Films.create({
                            name: filmName,
                            url: url
                        })

                        Films.findAll({
                            attributes: ['id'],
                            order: [['id', 'DESC']],
                            limit: 1,
                        }).then(async (data) => {
                            const uniqueArrayOfGenres = [...new Set(arrayOfGenres)]
                            for (let i = 0; i < uniqueArrayOfGenres.length; i++) {
                                await FilmsGenres.create({
                                    FilmId: data[0].getDataValue('id'),
                                    GenreId: uniqueArrayOfGenres[i]
                                })
                            }
                        })
                    } catch (e) {
                    } finally {
                        sendReplyMessage('Фильм добавлен успешно!', interaction)
                    }
                })
            } catch (e) {
                await sendReplyMessage('Что-то пошло не так. Попробуйте еще раз!', interaction)
            }
        } else if (command === 'show-all-films') {
            try {
                let filmID = ''
                let filmName = ''
                let filmDescription = ''

                const result = await getAllFilms()

                for (let i = 0; i < result.length; i++) {
                    filmID += `${result[i].id}\n`
                    filmName += `${result[i].name}\n`
                    filmDescription += `${result[i].url}\n`
                }

                const embed = await new Discord.MessageEmbed()
                    .setTitle('Список всех фильмов')
                    .setColor(config.color)
                    .setFooter('testT')
                    .setAuthor(config.appName)
                    .addFields([{
                        name: 'ID:',
                        value: filmID,
                        inline: true
                    }, {
                        name: 'Название:',
                        value: filmName,
                        inline: true
                    }, {
                        name: 'Описание:',
                        value: filmDescription,
                        inline: true
                    }])

                client.api.interactions(interaction.id, interaction.token).callback.post({
                    data: {
                        type: 4,
                        data: await createAPIMessage(interaction, embed)
                    },
                })
            } catch (e) {
                await sendReplyMessage('Что-то пошло не так. Попробуйте еще раз!', interaction)
            }
        } else if (command === 'delete-film') {
            try {
                const filmId = interaction.data.options[0].value

                await Films.destroy({
                    where: {id: filmId}
                })

                await FilmsGenres.destroy({
                    where: {FilmId: filmId}
                })

                await sendReplyMessage('Фильм удален успешно!', interaction)
            } catch (e) {
                await sendReplyMessage('Что-то пошло не так. Попробуйте еще раз!', interaction)
            }
        } else if (command === 'add-birthday') {
            try {
                const regex = /^(0?[1-9]|[12][0-9]|3[01])[\.](0?[1-9]|1[012])[\.]\d{4}$/
                const userTag = interaction.data.options[0].value
                const userBirthday = interaction.data.options[1].value

                if (regex.test(userBirthday)) {
                    await Birthday.create({
                        UserTag: userTag,
                        UserBirthday: (moment(userBirthday, 'DD.MM.YYYY').format('YYYY-MM-DD'))
                    })

                    await sendReplyMessage('Дата рождения пользователя добавлена успешно!', interaction)
                } else {
                    await sendReplyMessage('Неверная дата!', interaction)
                }
            } catch (e) {
                await sendReplyMessage('Что-то пошло не так. Попробуйте еще раз!', interaction)
            }
        }
    }
})

const createAPIMessage = async (interaction, content) => {
    const {data, files} = await Discord.APIMessage.create(client.channels.resolve(interaction.channel_id), content)
        .resolveData()
        .resolveFiles()

    return {...data, files}
}

const createAppCommand = async (data, guildID) => {
    return client.api.applications(client.user.id).guilds(guildID).commands.post({
        data: data
    })
}

const sendReplyMessage = async (message, interaction) => {
    client.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: {
                content: message,
                flags: 64
            }
        }
    })
}

const getAllGenres = async () => {
    const arrayOfGenres = []
    const genres = await Genres.findAll({
        attributes: ['id', 'name'],
        raw: true,
        order: Sequelize.literal('random()'),
        limit: 25
    })

    for (const genreObj of genres) {
        arrayOfGenres.push({
            name: genreObj['name'],
            value: genreObj['id']
        })
    }

    return arrayOfGenres
}

const getAllFilms = async () => {
    const filmsInformation = []

    const films = await Films.findAll({})

    for (const filmObj of films) {
        filmsInformation.push({
            id: filmObj['id'],
            name: filmObj['name'],
            url: filmObj['url']
        })
    }

    return filmsInformation
}

client.login('ODU3MDI0MTA2MjgxNDM1MTc3.YNJj5Q.lyqnVAJWTt6FZ-oB-Tk3coftaZA')