import React from 'react'
import axios from 'axios'
import { useState } from 'react'
import { useEffect } from 'react'

const App = () => {

  const [apiData, setApiData] = useState([])
  const [input, setInput] = useState('')
  const [filterData, setFilter] = useState([])
  const weatherApi = import.meta.env.VITE_WEATHER_API_KEY
  const [weatherData, setWeatherData] = useState(null)

  useEffect(() => {
    axios.get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setApiData(response.data)
        console.log('Data successfully fetched from API and stored in a state')
      })
      .catch(error => {
        console.log('Cannot fetch data from API' + error)
      })
  }, [])

  useEffect(() => {
    console.log('Effect fired. Filter length:', filterData.length) // debug 1
    if (filterData.length === 1) {
      const lat = filterData[0].latlng[0]
      const lon = filterData[0].latlng[1]

      console.log('Using Key:', weatherApi) // debug 2 apikey loaded or not

      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApi}`)
        .then(response => {
          console.log('API Response received:', response.data)
          setWeatherData(response.data)
        })
        .catch(error => {
          console.log('API Error detail:', error.response ? error.response.data : error.message)
        })
    }
  }, [filterData, weatherApi])

  const handleInputChange = (e) => {
    const userInput = e.target.value.toLowerCase()
    setInput(userInput)
    const tempFilter = apiData.filter(i => i.name.common.toLowerCase().includes(userInput))
    setFilter(tempFilter)
  }

  const renderCountryAndWeather = () => {
    if (input === '') {
      return null
    }
    if (filterData.length > 10) {
      return <p>Too many matches, specify another filter.</p>
    }
    if (filterData.length === 1) {
      const country = filterData[0]
      return (
        <div>
          <h1>{country.name.common}</h1>
          <p>Capital - {country.capital[0]}</p>
          <p>Area - {country.area}</p>
          <h3>Languages</h3>
          <ul>
            {Object.values(country.languages).map(i => <li key={i}>{i}</li>)}
          </ul>
          <img src={country.flags.png} alt={country.flags.alt} />
          {weatherData ? (
            <>
              <h3>Weather in {country.capital[0]}</h3>
              <p>Temperature : {weatherData.main.temp - 273.15}°C</p>
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
              />
              <p>Wind : {weatherData.wind.speed}m/s towards {weatherData.wind.deg}°</p>
            </>
          ) : (
            <p>Loading weather data...</p>
          )}
        </div>
      )
    }
    if (filterData.length > 1 && filterData.length <= 10) {
      return (
        filterData.map((item, index) => (
          <li key={index}>{item.name.common} <button onClick={() => setFilter([item])}>show</button></li>
        )))
    }
    return <p>No matches found</p>
  }

  return (
    <>
      <p>Find countries: <input value={input} onChange={handleInputChange} /></p>
      {renderCountryAndWeather()}
    </>
  )
}

export default App
