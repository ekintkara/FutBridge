const axios = require('axios')
const logger = require('../logger/FutCronLogger')

const leagueArray = [
  8, 11, 13, 14, 16, 17, 18, 19, 20, 22, 23, 24, 25, 32, 34, 35, 36, 37, 38, 39,
  40, 41, 44, 45, 52, 53, 76, 96, 136, 152, 155, 170, 171, 172, 182, 185, 187,
  192, 196, 202, 203, 215, 217, 218, 229, 238, 242, 282, 290, 295, 308, 309,
  312, 325, 328, 330, 336, 347, 355, 358, 373, 384, 410, 445, 463, 491, 544,
  615, 649, 679, 955, 971, 1024, 1786, 11621,
]

const eventIdArray = []
const eventIdFinisedOrEtc = []
const eventArray = []

function getRandomWaitTime() {
  return Math.floor(Math.random() * (10000 - 5000 + 1)) + 5000
}

async function scheduledEventsCronJob() {
  const today = new Date()
  const endDate = new Date(today)
  endDate.setDate(endDate.getDate() + 2) // Bugünden itibaren 7 gün sonrasını al
  const dateRange = []
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  dateRange.push(yesterday.toISOString().split('T')[0]) // dünün tarihi

  const apiUrlscheduled =
    'https://api.sofascore.com/api/v1/sport/football/scheduled-events/'

  // Tarih aralığını oluştur
  let currentDate = new Date(today)
  while (currentDate <= endDate) {
    dateRange.push(currentDate.toISOString().split('T')[0])
    currentDate.setDate(currentDate.getDate() + 1)
  }

  console.log('tarihler', dateRange)

  for (const date1 of dateRange) {
    console.log('date', date1)
    await new Promise((resolve) => setTimeout(resolve, getRandomWaitTime()))
    const apiUrl1 = `${apiUrlscheduled}${date1}`
    try {
      const response = await axios.get(apiUrl1).catch((error) => {
        logger.log({
          level: 'error',
          message: error,
        })
      })

      const eventResponse = response.data.events
      for (const event of eventResponse) {
        if (leagueArray.includes(event.tournament.uniqueTournament.id)) {
          const eventObj = {
            id: event.id,
            startTimestamp: event.startTimestamp,
            statusDesc: event.status.description,
            //...
          }
          eventIdArray.push(event.id)
          eventArray.push(eventObj)
        }
      }
      const futRequestBody = {
        date: date1,
        data: eventArray,
      }
      try {
        await new Promise((resolve) => setTimeout(resolve, getRandomWaitTime()))

        const livescoreReq = await axios.post(
          'https://api20.futalert.co.uk/api/livescore/scheduledevents',
          futRequestBody
        )
        return livescoreReq
      } catch (error) {
        console.error(
          'hata mesajı :',
          error.message,
          'https://api20.futalert.co.uk/api/livescore/scheduledevents'
        )
      }
    } catch (error) {
      console.error(
        'hata mesajı :',
        error.message,
        'https://api20.futalert.co.uk/api/livescore/scheduledevents'
      )
    }
  }
}

async function incidentsCronJob() {
  eventArray.forEach((event) => {
    if (
      event.statusDesc !== 'Not started' &&
      event.statusDesc !== 'Postponed'
    ) {
      eventIdFinisedOrEtc.push(event.id)
    }
  })
  if (eventIdFinisedOrEtc) {
    const results = []

    for (const eventid of eventIdFinisedOrEtc) {
      await new Promise((resolve) => setTimeout(resolve, getRandomWaitTime()))
      try {
        const incidentsResponse = await axios
          .get(`https://api.sofascore.com/api/v1/event/${eventid}/incidents`)
          .catch((error) => {
            console.log('hata sofascore: ', error.message)
          })
        console.log('incidents atıldı')
        const forwardedResponse = await axios
          .post(
            'https://api20.futalert.co.uk/api/livescore/incidents',
            incidentsResponse.data
          )
          .catch((error) => {
            console.log('hata futalert: ', error.message)
          })
        console.log('livescore atıldı')
        results.push(forwardedResponse)
      } catch (error) {
        console.error(
          'hata mesajı :',
          error.message,
          `https://api.sofascore.com/api/v1/event/${eventid}/incidents`
        )
      }
    }

    return results
  }
}

async function lineupsCronJob() {
  eventArray.forEach((event) => {
    if (
      event.statusDesc !== 'Not started' &&
      event.statusDesc !== 'Postponed'
    ) {
      eventIdFinisedOrEtc.push(event.id)
    }
  })
  console.log(eventArray, 'eventarray')
  if (eventIdFinisedOrEtc) {
    const results = []

    for (const eventid of eventIdFinisedOrEtc) {
      await new Promise((resolve) => setTimeout(resolve, getRandomWaitTime()))
      try {
        const lineupsResponse = await axios
          .get(`https://api.sofascore.com/api/v1/event/${eventid}/lineups`)
          .catch((error) => {
            console.log('hata: ', error.message)
          })
        console.log('lineups atıldı')
        const forwardedResponse = await axios
          .post(
            'https://api20.futalert.co.uk/api/livescore/lineups',
            lineupsResponse.data
          )
          .catch((error) => {
            console.log('hata: ', error.message)
          })
        console.log('livescore atıldı')
        results.push(forwardedResponse)
      } catch (error) {
        console.error(
          'hata mesajı :',
          error.message,
          `https://api.sofascore.com/api/v1/event/${eventid}/lineups`
        )
      }
    }

    return results
  }
}

module.exports = {
  scheduledEventsCronJob,
  incidentsCronJob,
  lineupsCronJob,
}
