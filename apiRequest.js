const axios = require('axios')

// Axios ile istek yapma işlevi
async function fetchUniqueTournaments(reigonId) {
  const apiUrl = `https://api.sofascore.com/api/v1/category/${reigonId}/unique-tournaments`

  try {
    const response = await axios.get(apiUrl)
    return response.data // İstekten gelen veriyi döndürür
  } catch (error) {
    throw error
  }
}

//list all seasonyear and Ids use competitionId
async function fetchLeaugeToSeason(competitionId) {
  const apiUrl = `https://api.sofascore.com/api/v1/unique-tournament/${competitionId}/seasons`

  try {
    const response = await axios.get(apiUrl)
    return response.data
  } catch (error) {
    throw error
  }
}

//list all league teams
async function fetchCompetitionToTeam(competitionId,seasonId) {
    const apiUrl = `https://api.sofascore.com/api/v1/unique-tournament/${competitionId}/season/${seasonId}/statistics/info`
  
    try {
      const response = await axios.get(apiUrl)
      return response.data
    } catch (error) {
      throw error
    }
  }
  

module.exports = {
  fetchUniqueTournaments,
  fetchLeaugeToSeason,
  fetchCompetitionToTeam
  
}
