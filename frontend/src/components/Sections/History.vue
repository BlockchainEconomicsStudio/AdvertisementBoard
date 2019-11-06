<template>
  <div>
    <p><strong>广告牌历史记录</strong></p>
    <ul id="ArtContent">
      <li v-for="item in history" :key="item.id">
        <div>广告编号：{{ item.ad_id }}</div>
        <div>父广告编号：{{ item.parent_id }}</div>
        <div>所有者地址：{{ item.owner_address }}</div>
        <div>标价：{{ item.price }} ETH</div>
        <div>储备金：{{ item.deposit }} ETH</div>
        <div>内容：{{ item.content }}</div>
        <div>上次付税时间：{{ item.last_tax_pay_timestamp }}</div>
        <br>
      </li>
    </ul>
  </div>
</template>

<script>
import { timestampToDataString, weiToEth } from '../../js/utilities'
import { mapState } from 'vuex'
export default {
  data() {
    return {
      history: []
    };
  },
  computed: {
    ...mapState({
      coinbase: state => state.web3.coinbase
    }),
  },
  watch: {
    coinbase (coinbase) {
      this.isLogin = (coinbase != null) ? true : false
      this.getHistory(this.$route.params.id || 0);
    },
    $route(newRoute) {
      if (newRoute.params.id !== "undefined" && this.isLogin) {
        if (this.isLogin) {
          this.getHistory(newRoute.params.id)
        } else {
          this.getAllHistory()
        }
      }
    }
  },
  mounted() {

    let coinbase = this.$store.state.web3.coinbase
    this.isLogin = (coinbase != null) ? true : false
    if (this.$route.path == "/") {
      this.getAllHistory()
    } else {
      if (this.isLogin) {
        this.getHistory(this.$route.params.id || 0);
      } else {
        this.getAllHistory()
      }
    }
  },
  methods: {
    getHistory: async function(adId) {
      let result = await this.$root.getHistory(adId)
      this.history = []
      let resultJson = result.data.resp

      for (var i = 0; i < resultJson.length; i++) {
        let recordJson = resultJson[i]
        let id = recordJson.id
        let ad_id = recordJson.ad_id
        let parent_id = recordJson.parent_id
        let owner_address = recordJson.owner_address
        let price = weiToEth(parseInt(recordJson.price, 10));
        let deposit = weiToEth(parseInt(recordJson.deposit, 10));
        let last_tax_pay_timestamp = timestampToDataString(parseInt(recordJson.last_tax_pay_timestamp, 10))
        let content = recordJson.content
        let record = Object.assign({}, {id, ad_id, parent_id, owner_address, price, deposit, last_tax_pay_timestamp, content})

        this.history.unshift(record)
      }
    },
    getAllHistory: async function() {
      let result = await this.$root.getAllHistory()
      this.history = []
      let resultJson = result.data.resp

      for (var i = 0; i < resultJson.length; i++) {
        let recordJson = resultJson[i]
        if (recordJson.ad_id != 0) {
          continue
        }

        let id = recordJson.id
        let ad_id = recordJson.ad_id
        let parent_id = recordJson.parent_id
        let owner_address = recordJson.owner_address
        let price = weiToEth(parseInt(recordJson.price, 10));
        let deposit = weiToEth(parseInt(recordJson.deposit, 10));
        let last_tax_pay_timestamp = timestampToDataString(parseInt(recordJson.last_tax_pay_timestamp, 10))
        let content = recordJson.content
        let record = Object.assign({}, {id, ad_id, parent_id, owner_address, price, deposit, last_tax_pay_timestamp, content})
        
        this.history.unshift(record)
      }
    },
  }
};
</script>

<style lang="scss" scoped>
@import "../../styles/util.scss";
@import "../../styles/app.scss";
</style>
