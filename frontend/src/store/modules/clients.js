import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000'
})

const state = {
  clients: [],
  client: {},
  errors: {},
  existsErrors: false
}

const getters = {
  client: state => state.client,
  errors: state => state.errors,
  clients: state => {
    var clients = []
    state.clients.forEach(client => {
      clients.push({
        id: client['id'],
        identification: client['identification'],
        name: `${client['first_name']} ${client['last_name']}`,
        email: client['email'],
        phone: client['phone'],
        address: client['address'],
        vip: client['is_vip'],
        status: client['is_active']
      })
    })
    return clients
  },
  headers: (state, getters, rootGetters) => {
    return { headers: { Authorization: 'Token ' + rootGetters.authentication.token } }
  }
}

const mutations = {
  dataTable (state) {
    // eslint-disable-next-line
    $(function () { $('#table').DataTable() })
  },
  closeModal (state, modalName) {
    // eslint-disable-next-line
    $(modalName).modal('hide')
  },
  setErrors (state, errors) {
    state.errors = errors.response.data
    state.existsErrors = true
  },
  cleanErrors (state) {
    state.errors = {}
    state.existsErrors = false
  },
  cleanData (state) {
    state.errors = {}
    state.existsErrors = false
    state.client = {
      identification: null,
      first_name: null,
      last_name: null,
      email: null,
      is_active: true,
      phone: null,
      address: null,
      vip: null
    }
  }
}

const actions = {
  async getClients ({ state, getters }) {
    const response = await http.get('clients/', getters.headers)
    state.clients = response.data
  },
  async getClient ({ commit, state, getters }, id) {
    commit('cleanData')
    const response = await http.get(`clients/${id}/`, getters.headers)
    state.client = response.data
  },
  async deleteClient ({ dispatch, getters }, id) {
    await http.delete(`clients/${id}/`, getters.headers)
    await dispatch('getClients')
  },
  async addClient ({ dispatch, commit, state, getters }) {
    commit('cleanErrors')
    await http.post('clients/', state.client, getters.headers)
      .catch(errors => commit('setErrors', errors))
    if (!state.existsErrors) {
      await dispatch('getClients')
      commit('closeModal', '#create')
      commit('cleanData')
    }
  },
  async updateClient ({ dispatch, commit, state, getters }) {
    commit('cleanErrors')
    await http.put(`clients/${state.client.id}/`, state.client, getters.headers)
      .catch(errors => commit('setErrors', errors))
    if (!state.existsErrors) {
      await dispatch('getClients')
      commit('closeModal', '#update')
      commit('cleanData')
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
