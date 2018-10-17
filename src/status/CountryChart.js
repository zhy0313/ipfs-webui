import React from 'react'
import { translate } from 'react-i18next'
import { Title } from './Commons'
import { Pie } from 'react-chartjs-2'
import { connect } from 'redux-bundler-react'

const CountryChart = ({ t, peerLocations, className, doUpdateHash }) => {
  const countryLabels = {}
  const countsByCountry = {}

  Object.keys(peerLocations).forEach(peerId => {
    const { country_code: code, country_name: label } = peerLocations[peerId]
    countsByCountry[code] = (countsByCountry[code] || 0) + 1
    countryLabels[code] = label
  })

  const countryRanking = Object.keys(countsByCountry).sort((a, b) => {
    return countsByCountry[b] - countsByCountry[a]
  })

  const totalCountries = Object.keys(peerLocations).length

  let data

  if (countryRanking.length < 5) {
    data = countryRanking
      .map(code => Math.round((countsByCountry[code] / totalCountries) * 100))
  } else {
    data = countryRanking
      .slice(0, 3)
      .map(code => Math.round((countsByCountry[code] / totalCountries) * 100))

    data = data.concat(100 - data.reduce((total, p) => total + p))
  }

  const datasets = [{
    data,
    backgroundColor: ['#69c4cd', '#f39031', '#ea5037', '#3e9096'],
    label: 'Peer Countries'
  }]

  const options = {
    responsive: true,
    legend: {
      display: true,
      position: 'bottom'
    },
    tooltips: {
      displayColors: false,
      callbacks: {
        title: (tooltipItem, data) => data.labels[tooltipItem[0].index],
        label: (tooltipItem, data) => {
          const percent = data['datasets'][0]['data'][tooltipItem['index']]
          const count = Math.round((percent * totalCountries) / 100)
          const peerStr = t('peersCount', { count: count })

          return `${percent}% (${count} ${peerStr})`
        }
      }
    }
  }

  let labels

  if (countryRanking.length < 5) {
    labels = countryRanking.map(code => countryLabels[code])
  } else {
    labels = countryRanking
      .slice(0, 3)
      .map(code => countryLabels[code])
      .concat('Other')
  }

  const handleClick = () => doUpdateHash('/peers', { replace: true })

  return (
    <div>
      <Title classes='pointer' onClick={handleClick}>{t('distributionOfPeers')}</Title>
      <div className='nl3 nr3'>
        <Pie data={{ datasets, labels }} options={options} />
      </div>
    </div>
  )
}

export default connect(
  'selectPeerLocations',
  'doUpdateHash',
  translate('status')(CountryChart)
)
