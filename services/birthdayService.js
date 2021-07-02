const sequelize = require('../DB/database')
const moment = require('moment-timezone')

const Birthday = sequelize.Birthday

moment.locale('ru')

const birthdaySendCongratulations = async function (config, Discord, client) {
    const channel = client.channels.cache.find(channel => channel.id === config.mainChannel)

    const arrayOfCongratulations = [
        `Тебе желаю море счастья,
        Улыбок, солнца и тепла.
        Чтоб жизнь была еще прекрасней,
        Удача за руку вела!\n
        Пусть в доме будет только радость,
        Уют, достаток и покой.
        Друзья, родные будут рядом,
        Беда обходит стороной!\n
        Здоровья крепкого желаю
        И легких жизненных дорог.
        И пусть всегда, благословляя,
        Тебя хранит твой ангелок!`,
        `С днем рождения поздравляю
        И желаю день за днем
        Быть счастливее и ярче,
        Словно солнце за окном.\n
        Пожелаю я здоровья,
        Много смеха и тепла,
        Чтоб родные были рядом
        И, конечно же, добра!\n
        Пусть деньжат будет побольше,
        Путешествий и любви.
        Чашу полную заботы,
        Мира, света, красоты!`,
        `Пусть в жизни будет все, что нужно:
        Здоровье, мир, любовь и дружба.
        Не отвернется пусть успех,
        Удача любит больше всех.\n
        Пусть счастье будет настоящим,
        К мечте и радости манящим.
        Желаю много светлых лет
        Без боли, горестей и бед!`,
        `Поздравляем с днем рожденья!
         Желаем радостных мгновений.
         Побольше света и тепла,
         Улыбок, счастья и добра.\n
         Здоровья крепкого, везенья,
         Любви, удачи, настроенья.
         Больших побед на все года,
         Успеха в жизни навсегда!`
    ]

    let arrayOfBirthdays = await getAllTodayBirthdays()

    if (Array.isArray(arrayOfBirthdays) && arrayOfBirthdays.length) {
        for (let i = 0; i < arrayOfBirthdays.length; i++) {
            let element = arrayOfCongratulations[Math.floor(Math.random() * arrayOfCongratulations.length)];
            channel.send(`<@${arrayOfBirthdays[i]}>`)
            const embed = new Discord.MessageEmbed()
                .setTitle('С Днем Рождения!')
                .setColor(config.color)
                .setDescription(element)
                .setAuthor(config.appName)
                .setThumbnail('https://cdn.discordapp.com/attachments/857566261821833217/857588603781513236/rightP.png')
            channel.send(embed)
        }
    }
}

const getAllTodayBirthdays = async () => {
    const arrayOfBirthdayBoys = []

    const birthdays = await Birthday.findAll({where: {UserBirthday: moment().format('YYYY-MM-DD')}})

    for (const birthdaysObj of birthdays) {
        arrayOfBirthdayBoys.push(birthdaysObj['UserTag'])
    }

    return arrayOfBirthdayBoys
}

module.exports = {birthdayService: birthdaySendCongratulations}