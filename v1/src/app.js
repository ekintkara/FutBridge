const cron = require('node-cron')
const {
  scheduledEventsCronJob,
  incidentsAndLineupsCronJob,
  logSender,
} = require('./services/FutCronService')

cron.schedule('*/60 * * * *	', () => {

scheduledEventsCronJob()
.then(() => {
  console.log('scheduledEventsCronJob completed')
  return incidentsAndLineupsCronJob()
})
.catch((error) => {
  console.error(error.message)
  
})
  console.log('job working', new Date())
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
