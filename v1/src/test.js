const axios = require('axios')

// Dizi ve değişkenlerin kapsamını düzenleyin
let eventIdFinisedOrEtc = []
let eventArray = []
const leagueArray = [
  8, 11, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24, 25, 32, 34, 35, 36, 37, 38, 39,
  40, 41, 44, 45, 52, 53, 76, 96, 136, 152, 155, 170, 171, 172, 182, 185, 187,
  192, 196, 202, 203, 215, 217, 218, 229, 238, 242, 282, 290, 295, 308, 309,
  312, 325, 328, 330, 336, 347, 355, 358, 373, 384, 410, 445, 463, 491, 544,
  615, 649, 679, 955, 971, 1024, 1786, 11621,
] // Liginizin benzersiz kimliği olan diziyi doldurun

async function scheduledEventsCronJob() {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 2)
  const dateRange = []
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  dateRange.push(yesterday.toISOString().split('T')[0])

  let currentDate = new Date(today)
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
  const apiToSend = 'http://localhost:3000/api/scheduledevents'
  console.log('date1', date1)

  await sleep(getRandomWaitTime())

  const apiUrl1 = `${apiUrlscheduled}${date1}`

  try {
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
        event.status?.type !== 'finished' &&
        event.status?.type !== 'postponed'
      ) {
        eventIdFinisedOrEtc.push(event.id)
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
        'livescoreReq hata mesajı:',
        error.message,
        'https://api20.futalert.co.uk/api/livescore/scheduledevents'
      )
    }
  } catch (error) {
    console.error(
      'apiUrlscheduled hata mesajı:',
      error,
      'https://api20.futalert.co.uk/api/livescore/scheduledevents'
    )
  }
}

async function incidentsAndLineupsCronJob() {
  if (eventIdFinisedOrEtc.length > 0) {
    const apiToSendIncidents = 'http://localhost:3000/api/incidents'
    const apiToSendLineups = 'http://localhost:3000/api/lineups'
    console.log(eventIdFinisedOrEtc, 'eventIdFinisedOrEtc')

    const promises = eventIdFinisedOrEtc.map(async (eventid) => {
      await sleep(getRandomWaitTime())
      console.log(eventid, 'eventid')

      try {
        const incidentsResponse = await axios
          .get(`https://api.sofascore.com/api/v1/event/${eventid}/incidents`)
          .catch((error) => {
            console.log(error.message)
          })

        console.log('incidents atıldı')

        await sleep(getRandomWaitTime())

        const lineupsResponse = await axios
          .get(`https://api.sofascore.com/api/v1/event/${eventid}/lineups`)
          .catch((error) => {
            console.log('hata:', error.message)
          })

        console.log('lineups atıldı')

        const incidentsResBody = {
          eventid: eventid,
          data: incidentsResponse.data,
        }

        await axios
          .post(apiToSendLineups, lineupsResponse.data)
          .catch((error) => {
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
          `https://api.sofascore.com/api/v1/event/${eventid}/incidents`
        )
      }
    })

    await Promise.all(promises)

    eventIdFinisedOrEtc = []
  }
}

function getRandomWaitTime() {
  return Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
