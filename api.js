const express = require('express')
const { fetchUniqueTournaments,fetchLeaugeToSeason,fetchCompetitionToTeam } = require('./apiRequest');

const app = express()
const port = 3000



module.exports = {
  fetchUniqueTournaments,
}


app.get('/', (req, res) => {
  res.send("Merhaba! Web API'ye hoş geldiniz.")
})


app.get('/api/hello', (req, res) => {
  res.json({ message: 'Merhaba, bu bir API endpointidir.' })
})

app.get('/api/unique-tournaments/', async (req, res) => {
  const reigonId = req.query.reigonId // İstek sorgu parametresinden reigonId alınır

  if (!reigonId) {
    return res.status(400).json({ error: 'reigonId eksik. harbi mi' })
  }

  try {
    const uniqueTournaments = await fetchUniqueTournaments(reigonId)
    res.json(uniqueTournaments)
  } catch (error) {
    res.status(500).json({ error: 'Veri alınamadı.' })
  }
})

app.get('/api/seasons/', async (req, res) => {
    const competitionId = req.query.competitionId // İstek sorgu parametresinden competitionId alınır
  
    if (!competitionId) {
      return res.status(400).json({ error: 'competitionId eksik. harbi mi' })
    }
  
    try {
      const seasons = await fetchLeaugeToSeason(competitionId)
      res.json(seasons)
    } catch (error) {
      res.status(500).json({ error: 'Veri alınamadı.' })
    }
  })

// Sunucuyu başlatma
app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor.`)
})
