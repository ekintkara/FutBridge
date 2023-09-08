const cron = require('node-cron')
const {
  scheduledEventsCronJob,
  incidentsCronJob,
  lineupsCronJob,
} = require('./services/FutCronService')

cron.schedule('*/1 * * * *	', () => {
 
  console.log('job working', new Date())
})

 scheduledEventsCronJob()
    .then(() => {
      console.log('scheduledEventsCronJob completed')
      return incidentsCronJob()
    })
    .then(() => {
      console.log('incidentsCronJob completed')
      return lineupsCronJob()
    })
    .catch((error) => {
      console.error(error)
    })
