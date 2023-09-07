const cron = require('node-cron')
const {
  scheduledEventsCronJob,
  incidentsCronJob,
} = require('./services/FutCronService')

cron.schedule('* * * * *	', () => {
  console.log('job working', new Date())
  
})
scheduledEventsCronJob()
    .then(() => {
      console.log('scheduledEventsCronJob completed')
      return incidentsCronJob()
    })
    .then(console.log('incidentsCronJob completed'))
    .catch((error) => {
      console.error(error)
    })