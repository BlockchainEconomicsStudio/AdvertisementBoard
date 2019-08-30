import { MUTATION_TYPES, APPROVED_NETWORK_ID, NETWORKS } from '../util/constants'

function resetUser (state, web3Status = {}) {
  const user = {
    balance: '0.00',
    coinbase: '',
    email: '',
    firstName: '',
    hasCoinbase: false,
    hasWeb3InjectedBrowser: false,
    isConnectedToApprovedNetwork: false,
    isLoggedIn: false,
    lastName: ''
  }

  const userCopy = state.user
  Object.assign(userCopy, user, web3Status)
  state.user = userCopy
}

export default {
  [MUTATION_TYPES.REGISTER_WEB3_INSTANCE] (state, payload) {
    const result = payload.result

    const web3Copy = state.web3
    web3Copy.instance = () => result.web3()
    web3Copy.address = result.address ? result.address.toString() : web3Copy.address
    web3Copy.coinbase = result.coinbase ? result.coinbase.toString() : web3Copy.coinbase
    web3Copy.networkId = result.networkId ? result.networkId.toString() : web3Copy.networkId
    web3Copy.error = result.web3Error ? result.web3Error : web3Copy.error
    web3Copy.isInjected = result.hasInjectedWeb3 ? result.hasInjectedWeb3 : web3Copy.isInjected

    state.web3 = web3Copy

    if (payload.callback) payload.callback(state)
  },
  [MUTATION_TYPES.UPDATE_USER_BLOCKCHAIN_STATUS] (state, payload) {
    const hasWeb3InjectedBrowser = state.web3.isInjected
    const hasCoinbase = !!(state.web3.coinbase && state.web3.coinbase !== '')
    const coinbase = state.web3.coinbase
    const approvedNetworkId = APPROVED_NETWORK_ID || state.web3.networkId
    const isConnectedToApprovedNetwork = !!(state.web3.networkId && state.web3.networkId !== '' && state.web3.networkId === approvedNetworkId)
    const web3Status = {
      hasWeb3InjectedBrowser,
      hasCoinbase,
      isConnectedToApprovedNetwork,
      coinbase
    }

    let warningMessage = null
    if (hasWeb3InjectedBrowser) {
      if (hasCoinbase) {
        if (!isConnectedToApprovedNetwork) {
          warningMessage = `You're not on the same Blockchain as us. Please connect to the ${NETWORKS[approvedNetworkId]}`
        }
      } else {
        warningMessage = "Looks like you haven't logged into your Web3 injector. If you're using Metamask and you'd signed up, please log into Metamask, else click on the 'Sign Up' link above to begin."
      }
    } else {
      warningMessage = 'Your browser is not Web3-enabled.'
    }

    if (hasWeb3InjectedBrowser && hasCoinbase && isConnectedToApprovedNetwork) {
      const userCopy = state.user
      Object.assign(userCopy, web3Status)
      state.user = userCopy
    } else {
      resetUser(state, web3Status)
    }

    if (payload.callback) payload.callback({ status: !warningMessage, warningMessage })
  },
  [MUTATION_TYPES.UPDATE_WEB3_PROPERTIES] (state, payload) {
    for (var i = payload.properties.length - 1; i >= 0; i--) {
      state.web3[payload.properties[i]] = payload.values[i]
      if (state.user[payload.properties[i]]) state.user[payload.properties[i]] = payload.values[i]
    }
  },
  [MUTATION_TYPES.SET_CURRENT_VIEW] (state, newRoute) {
    state.currentView = newRoute.meta.view
  },
  [MUTATION_TYPES.UPDATE_DAPP_READINESS] (state, isReady) {
    state.isDAppReady = isReady
  },
  [MUTATION_TYPES.CHANGE_CURRENT_ROUTE_TO] (state, newRoute) {
    state.currentRoute = newRoute
  },
  [MUTATION_TYPES.UPDATE_CURRENT_ADBOARD] (state, payload) {

    const adboardCopy = state.currentAdBoard
    adboardCopy.adId = payload.adId ? payload.adId : adboardCopy.adId
    adboardCopy.owner = payload.owner ? payload.owner : adboardCopy.owner
    adboardCopy.parentId = payload.parentId ? payload.parentId : adboardCopy.parentId
    adboardCopy.price = payload.price ? payload.price : adboardCopy.price
    adboardCopy.taxRate = payload.netwotaxRaterkId ? payload.taxRate : adboardCopy.taxRate
    adboardCopy.state = payload.state ? payload.state : adboardCopy.state
    adboardCopy.lastTaxPayTimestamp = payload.lastTaxPayTimestamp ? payload.lastTaxPayTimestamp : adboardCopy.lastTaxPayTimestamp
    adboardCopy.content = payload.content ? payload.content : adboardCopy.content

    state.currentAdBoard = adboardCopy
    
    if (payload.callback) payload.callback(state)
  }
}
