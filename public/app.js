import * as axios from 'axios'

let file = null

const $uploadInput = document.getElementById('upload')
const $uploadButton = document.getElementById('uploadB')

$uploadInput.addEventListener('change', (e) => {
  file = e.target.files[0]
})

$uploadButton.addEventListener('click', (e) => {
  e.preventDefault()
  const formData = new FormData()
  formData.append("upload", file)
  debugger
  axios.post('http://localhost:8000/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
    .then(function (response) {
      debugger
      const events = countEvents(response.data.events)
      const probabilities = probability(events, response.data.events.length)
      const sorts = sortEvents(validEvent(probabilities))
      let steps = {}
      console.dir(sorts);
      calculateProbability(steps, 1, sorts.reverse())
      calculateCode(steps)
      console.dir(steps)
    })
    .catch(function (error) {
      console.log(error);
    });
})


function countEvents(data) {
  const cache = {}
  const results = []
  let counter = 1
  data.map(_d => {
    if (!cache[_d]) {
      const filters = data.filter(_k => _k === _d)
      const event = {
        key: _d,
        event: `S${counter}`,
        messageSize: data.length,
        totalKey: filters.length
      }
      cache[_d] = filters.length
      results.push(event)
      counter += 1
    }
  })
  return results
}

function probability(data) {
  const results = data.map(_d => {
    const value = _d.totalKey / _d.messageSize
    _d.probability = parseFloat(value.toFixed(2))
    return _d
  })
  return results
}

function validEvent(data) {
  let results = [...data]
  if (data.length % 2 === 0) {
    const event = {
      key: "falso",
      messageSize: 0,
      event: `S${data.length + 1}`,
      totalKey: 0,
      probability: 0
    }
    results = [...results, event]
  }
  return results
}

function sortEvents(data) {
  const results = data.sort((a, b) => a.probability - b.probability)
  return results
}

function calculateProbability(store, step, data) {
  if (data.length > 3) {
    let acum = 0
    const key = `step_${step}`
    store[key] = {sum: {}, events: []}
    for (let i = 0; i < 3; i++) {
      const current = data.pop()
      store[key].sum[i] = current
      acum += current.probability * 100
    }
    const event = {
      key: 'sum',
      messageSize: 0,
      event: key,
      totalKey: 0,
      probability: parseFloat((acum / 100).toFixed(2))

    }
    const newData = sortEvents([...data, event])
    const desc = newData.reverse()
    store[`step_${step}`].events = desc
    step += 1
    calculateProbability(store, step, desc)
  }
}

function calculateCode(steps) {
  const keys = Object.keys(steps).reverse()
  let events = steps[keys[0]].events.map((_d, index) => {
    _d.code = index.toString()
    return _d
  })
  events = extractCodes(keys, events, 0, steps)
  console.log('events')
  console.dir(events)
}

function extractCodes(keys, events, step, steps) {
  if (step < keys.length) {
    const sums = steps[keys[step]].sum
    const currentStep = events.find(_e => _e.event === keys[step])
    const newEvents = events.filter(_e => _e.event !== keys[step])
    const sumKeys = Object.keys(sums).reverse()
    sumKeys.map((_k, index) => {
      const data = sums[_k]
      data.code = currentStep.code + index
      newEvents.push(data)
    })
    events = extractCodes(keys, newEvents, step + 1, steps)
  }
  return events
}