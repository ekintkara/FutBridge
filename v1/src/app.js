const cron = require('node-cron')
const {
  scheduledEventsCronJob,
  incidentsAndLineupsCronJob,
} = require('./services/FutCronService')

cron.schedule('*/120 * * * *	', () => {
  console.log('job working', new Date())
  scheduledEventsCronJob()
    .then(() => {
      console.log('scheduledEventsCronJob completed')
      return incidentsAndLineupsCronJob()
    })
    .catch((error) => {
      console.error(error.message)
    })
  console.log('job finished', new Date())
})

// cron.schedule('*/60 * * * *	', () => {

// })
//   logSender()
//     .then(() => {
//       console.log('logs sent')
//     })
//     .catch((error) => {
//       console.log('error:', error)
//     })
