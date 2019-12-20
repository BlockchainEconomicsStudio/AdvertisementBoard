<template>
  <div class="container-outer boxclass">
    <top-navigation ref="top-navigation" />
    <div class="boxsecond">
      <!-- Mobile -->
      <div v-if="dataflat">
        <artcontent_mb
          ref="artcontent_mb"
          :language="language"
          :artprice="artprice"
          :etzprice="etzprice"
          :currentpatron="currentpatron"
          :time-held="timeHeld"
          :ad-board-id="adBoardId"
          :parent-board-id="parentBoardId"
          :depositable="depositable"
          :due-date="dueDate"
          :total-collected="totalCollected"
          :art-title="artTitle"
          :art-name="artName"
          :tips1="tips1"
        />
      </div>
      <!-- PC -->
      <div v-else>
        <artcontent_pc
          ref="artcontent_pc"
          :language="language"
          :artprice="artprice"
          :etzprice="etzprice"
          :currentpatron="currentpatron"
          :time-held="timeHeld"
          :ad-board-id="adBoardId"
          :parent-board-id="parentBoardId"
          :depositable="depositable"
          :due-date="dueDate"
          :total-collected="totalCollected"
          :art-title="artTitle"
          :art-name="artName"
          :tips1="tips1"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TopNavigation from "./Sections/TopNavigation";
import ArtContent_mb from "./Sections/ArtContent_mb";
import ArtContent_pc from "./Sections/ArtContent_pc";
import { timestampToDataString } from '../js/utilities'
import { mapState } from 'vuex'
export default {
  name: "Main",
  components: {
    "top-navigation": TopNavigation,
    "artcontent_mb": ArtContent_mb,
    "artcontent_pc": ArtContent_pc
  },
  data() {
    return {
      dataflat: false,
      language: "en",
      artprice: "0",
      etzprice: "0",
      currentpatron: "",
      timeHeld: "0",
      adBoardId: "N/A",
      parentBoardId: "N/A",
      depositable: "0",
      dueDate: "0",
      totalCollected: "0",
      artName: "",
      artTitle: "一块广告牌",
      contenttips: "本广告牌字数限制：24个中文字符/48个字符",
      tips1: "持有者管理广告牌",
      isLogin:false,
      isOwner:false,
      isRequestingHistory:false
    };
  },
  computed: {
    ...mapState({
      coinbase: state => state.web3.coinbase,
    })
  },
  watch: {
    coinbase (coinbase) {
      this.dataflat = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
      this.isLogin = (coinbase != null) ? true : false
      if (this.isLogin) {
        this.$root.reloadSiteWithinWindow(this.$route.params.id || 0)
        this.getData(this.$route.params.id || 0);
        this.autoPrice();
      }
    },
    $route(newRoute) {
      if (newRoute.params.id !== "undefined") {
        if (this.isLogin) {
          this.getData(newRoute.params.id);
          this.autoPrice();
        } else {
          this.getHistory(this.$route.params.id || 0)
        }
      }
    }
  },
  mounted() {
    this.init();
  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
  methods: {
    init: function() {
      let coinbase = this.$store.state.web3.coinbase;
      this.dataflat = navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
      this.isLogin = (coinbase != null) ? true : false
      if (this.$route.path == "/") {
        this.getHistory(0);
      } else {
        if (this.isLogin) {
          this.getData(this.$store.state.currentAdBoard.adId || 0)
        } else {
          this.getHistory(this.$route.params.id || 0);
        }
      }

      this.$trans.$off("operate");
      // eslint-disable-next-line no-unused-vars
      this.$trans.$on("operate", data => {
        this.getData(this.$store.state.currentAdBoard.adId)
      });
    },
    autoPrice: function(){
      this.timer = setInterval(() => {
        this.getData(this.$store.state.currentAdBoard.adId)
      }, 60 * 1000); // 1 minutes
    },
    getData: async function(adId) {

      let ethpriceResult = await this.$root.getEthPrice();
      let ethprice = ethpriceResult.data.USD;

      let depositable = await this.$root.getDepositAbleToWithdraw(adId);
      this.depositable = String(depositable / 10 ** 18).substr(0, 4);

      let dueDate = await this.$root.getDueDate(adId);
      this.dueDate = timestampToDataString(parseInt(dueDate, 10))

      let totalCollected = await this.$root.getTotalTaxIncome();
      // this.totalCollected =
      //   " " + Number(totalCollected / 10 ** 18).toFixed(2) + " ETH";
      this.totalCollected = Number(totalCollected / 10 ** 18).toFixed(2);

      let adboardData = await this.$root.getAdBoardData(adId);
      this.adBoardId = adId;
      this.parentBoardId = adboardData.parentId;
      this.currentpatron = adboardData.owner;
      
      this.artprice = adboardData.price / 10 ** 18;
      this.etzprice = Number((Number(ethprice) * 6.7 * adboardData.price) / 10 ** 18).toFixed(2);
      this.artName = adboardData.content;

      let timeLastCollected = adboardData.lastTaxPayTimestamp;
      if (timeLastCollected > 0) {
        this.timeHeld =
          parseInt(
            (new Date().getTime() - timeLastCollected * 1000) / 86400000
          ) + " 日";
      } else {
        this.timeHeld = "0 日";
      }
    },
    getHistory: async function(adId) {
      if (this.isRequestingHistory) {
        return;
      }
      this.isRequestingHistory = true;

      let result = await this.$root.getHistory(adId)
      let resultJson = result.data.resp

      if (resultJson.length > 0) {
        let recordJson = resultJson[0]
        this.artName = recordJson.content;
      }

      this.isRequestingHistory = false;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../styles/util.scss";
@import "../styles/app.scss";
</style>
