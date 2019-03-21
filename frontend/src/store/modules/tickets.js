import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000'
})

const WS = 'ws://localhost:8000/ws/tickets/'

const state = {
  ticket: {},
  identification: '',
  webSocket: null,
  currentTicket: {
    turn_number: ''
  },
  listView: false
}

const getters = {
  identification: state => state.identification,
  currentTicket: state => state.currentTicket
}

const mutations = {
  initWSConection (state) {
    state.webSocket = new WebSocket(WS)
  },
  cleanData (state) {
    state.ticket = {}
    state.identification = ''
  },
  setView (state) {
    state.listView = true
  },
  setService (state, service) {
    state.ticket.activity = service
  },
  change (state, value) {
    if (value === 'DEL') {
      state.identification = state.identification.slice(0, -1)
    } else if (state.identification.length < 10) {
      state.identification += value
    }
  }
}

const actions = {
  async getTicket ({ state }) {
    state.ticket.user = state.identification
    state.ticket.turn_number = '001'
    await http.post('tickets/', state.ticket)
  },
  send ({ state, rootGetters }, service) {
    state.webSocket.send(JSON.stringify({
      'service': service,
      'operator': rootGetters['authentication/authUser']['id']
    }))
  },
  retrieve ({ state, rootGetters }) {
    state.webSocket.onmessage = (response) => {
      const data = JSON.parse(response.data)
      if (data['operator'] === rootGetters['authentication/authUser']['id'] || state.listView) {
        if (data['with-ticket']) {
          state.currentTicket = data['ticket']
        } else {
          state.currentTicket = {
            turn_number: ''
          }
        }
      }
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}