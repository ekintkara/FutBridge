const axios = require('axios')
const logger = require('../logger/FutCronLogger')
const { schedule } = require('node-cron')
const { log } = require('util')

const leagueArray = [
  8, 11, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24, 25, 32, 34, 35, 36, 37, 38, 39,
  40, 41, 44, 45, 52, 53, 76, 96, 136, 152, 155, 170, 171, 172, 182, 185, 187,
  192, 196, 202, 203, 215, 217, 218, 229, 238, 242, 282, 290, 295, 308, 309,
  312, 325, 328, 330, 336, 347, 355, 358, 373, 384, 410, 445, 463, 491, 544,
  615, 649, 679, 955, 971, 1024, 1786, 11621, 232, 1044, 1139, 1690, 1127,
  10527, 13994, 214, 2054, 10640, 823, 2123,
]

let eventIdArray = []
let eventArray = []
let eventIdFinisedOrEtc = []

function getRandomWaitTime() {
  return Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}



async function scheduledEventsCronJob() {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - 4) // Bugünden itibaren 4 gün öncesini al
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 3) // Bugünden itibaren 3 gün sonrasını al
  const dateRange = []

  let currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    dateRange.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  console.log('dateRange', dateRange)

  for (const date1 of dateRange) {
    console.log('for oncesi date1', date1)
    await scheduledEventsJobsLoops(date1)
  }
}
async function scheduledEventsJobsLoops(date1) {
  const apiUrlscheduled =
    'https://api.sofascore.com/api/v1/sport/football/scheduled-events/'
  const apiToSend = 'https://api20.futalert.co.uk/api/livescore/scheduledevents'
  console.log('date1', date1)

  await sleep(getRandomWaitTime())

  const apiUrl1 = `${apiUrlscheduled}${date1}`

  try {
    await sleep(getRandomWaitTime())
    const response = await axios.get(apiUrl1).catch((error) => {
      console.log(error.message)
    })

    const eventResponse = response.data.events

    for (const event of eventResponse) {
      if (leagueArray.includes(event.tournament?.uniqueTournament?.id)) {
        eventIdArray.push(event.id)
        eventArray.push({
          tournament: {
            uniqueTournament: {
              id: event.tournament.uniqueTournament.id,
            },
          },
          status: {
            description: event.status.description,
            type: event.status.type,
          },
          winnerCode: event.winnerCode,
          homeTeam: {
            name: event.homeTeam.name,
            slug: event.homeTeam.slug,
            shortName: event.homeTeam.shortName,
            id: event.homeTeam.id,
          },
          awayTeam: {
            name: event.awayTeam.name,
            slug: event.awayTeam.slug,
            shortName: event.awayTeam.shortName,
            id: event.awayTeam.id,
          },
          homeScore: {
            current: event.homeScore.current,
            display: event.homeScore.display,
            period1: event.homeScore.period1,
            period2: event.homeScore.period2,
            normaltime: event.homeScore.normaltime,
          },
          awayScore: {
            current: event.awayScore.current,
            display: event.awayScore.display,
            period1: event.awayScore.period1,
            period2: event.awayScore.period2,
            normaltime: event.awayScore.normaltime,
          },
          time: {
            injuryTime1: event.time.injuryTime1,
            injuryTime2: event.time.injuryTime2,
            currentPeriodStartTimestamp: event.time.currentPeriodStartTimestamp,
          },
          id: event.id,
          startTimestamp: event.startTimestamp,
          slug: event.slug,
        })
      }
    }

    for (const event of eventArray) {
      if (
        event.status?.type !== 'finished' ||
        event.status?.type !== 'postponed'
      ) {
        const eventData = {
          eventId: event.id,
          homeTeamId: event.homeTeam.id,
          homeTeamName: event.homeTeam.name,
          awayTeamId: event.awayTeam.id,
          awayTeamName: event.awayTeam.name,
        }
        eventIdFinisedOrEtc.push(eventData)
      }
    }

    const futRequestBody = {
      date: date1,
      data: eventArray,
    }

    try {
      await sleep(getRandomWaitTime())

      const livescoreReq = await axios
        .post(apiToSend, futRequestBody)
        .catch((error) => {
          console.log(error.message)
        })
        .finally(() => {
          eventArray = []
        })
      return livescoreReq
    } catch (error) {
      console.error(
        'livescoreReq hata mesajı :',
        error.message,
        'https://api20.futalert.co.uk/api/livescore/scheduledevents'
      )
    }
  } catch (error) {
    console.error(
      'apiUrlscheduled hata mesajı :',
      error,
      'https://api20.futalert.co.uk/api/livescore/scheduledevents'
    )
  }
}

async function incidentsAndLineupsCronJob() {
  if (eventIdFinisedOrEtc.length > 0) {
    const apiToSendIncidents =
      'https://api20.futalert.co.uk/api/livescore/incidents'
    const apiToSendLineups =
      'https://api20.futalert.co.uk/api/livescore/lineups'
    console.log(eventIdFinisedOrEtc, 'eventIdFinisedOrEtc')
    for (const eventData of eventIdFinisedOrEtc) {
      await sleep(getRandomWaitTime())
      console.log(eventData.eventId, 'eventid')

      try {
        const incidentsResponse = await axios
          .get(
            `https://api.sofascore.com/api/v1/event/${eventData.eventId}/incidents`
          )
          .catch((error) => {
            console.log(error.message)
          })

        console.log('incidents atıldı')

        await sleep(getRandomWaitTime())

        const lineupsResponse = await axios
          .get(
            `https://api.sofascore.com/api/v1/event/${eventData.eventId}/lineups`
          )
          .catch((error) => {
            console.log('hata:', error.message)
          })

        console.log('lineups atıldı')

        const incidentsResBody = {
          eventId: eventData.eventId,
          eventData: eventData,
          data: incidentsResponse.data,
        }
        const lineupsResBody = {
          eventId: eventData.eventId,
          eventData: eventData,
          data: lineupsResponse.data,
        }

        await axios.post(apiToSendLineups, lineupsResBody).catch((error) => {
          console.log('hata:', error.message)
        })

        console.log('faLineup')

        await axios
          .post(apiToSendIncidents, incidentsResBody)
          .catch((error) => {
            console.log(error.message)
          })

        console.log('faIncident')
      } catch (error) {
        console.error(
          'hata mesajı:',
          error.message,
          `https://api.sofascore.com/api/v1/event/${eventData.eventId}/incidents`
        )
      }
    }

    eventIdFinisedOrEtc = []
  }
}

// async function logSender() {
//   const logFolderPath = path.join(__dirname, 'v1', 'logger', 'log')
//   const logFilePath = path.join(logFolderPath, 'log.json')

//   fs.readFile(logFilePath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Log Error', err)
//       return
//     }
//     const logs = JSON.parse(data)
//     axios
//       .post('https://api20.futalert.co.uk/api/livescore/logs', logs)
//       .then((response) => {
//         console.log("Loglar başarıyla API'ye gönderildi:", response.data)
//       })
//       .catch((error) => {
//         console.error("Logları API'ye gönderirken bir hata oluştu:", error)
//       })
//   })
// }

module.exports = {
  scheduledEventsCronJob,
  incidentsAndLineupsCronJob,
}
