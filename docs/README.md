---
home: false
# heroImage: /hero.png
heroText: Hero 标题
tagline: Hero 副标题
actionText: 快速上手 →
actionLink: /zh/guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
# 案例代码
## 碰撞检测
```javascript
  <template>
  <div class="mack-tea">
    <div class="mack-tea-main">
      <div v-if="!isCrash" class="mack-tea-hint"></div>
      <!-- 茶叶 -->
      <transition name="fade">
        <div
          ref="reaDom"
          class="tea"
          @touchstart="teaOnDown"
          v-if="!isCrash"
        ></div>
      </transition>
      <!-- 茶几 -->
      <div ref="potDom" class="pot"></div>
      <!-- 烧水壶 -->
      <div ref="kettle" class="kettle"></div>
      <!-- 重新阅读 -->
      <div class="readTask">
        <div class="readTask-content" v-throttle:click.1000="againRead">
          <div class="img-warp">
            <img :src="todayTeaData.picUrl" alt="" />
          </div>
          <div class="hint">
            <div>重新阅读 完成冲泡</div>
          </div>
        </div>
      </div>
    </div>
    <ReadTaskModel
      :todayTeaData="todayTeaData"
      v-if="showReadTaskModel"
      :againRead="true"
      :show.sync="showReadTaskModel"
    />
    <!-- 温度条 -->
    <div class="progress">
      <!-- 水温 -->
      <span class="progress-show">水温 {{ temperature }}℃</span>
      <button @click="temperatureSub">-</button>
      <div class="progress-bar">
        <div
          class="progress-bar-centent"
          :style="{ width: temperature + '%' }"
        ></div>
      </div>
      <button @click="temperatureAdd">+</button>
    </div>
    <!-- 开始冲泡按钮 -->
    <div class="start-brew-warp">
      <div
        class="start-brew-btn"
        v-throttle:click.500="checkTemperature"
      ></div>
    </div>
    <!-- 冲泡中栓茶动画 -->
    <transition name="fade">
      <div v-if="showMackTeaIng" class="make-tea-ing" @touchmove.prevent>
        <span class="count-down">{{ this.countDown }} 秒</span>
        <div ref="mackTeaIng" class="mack-tea-anima"></div>
      </div>
    </transition>
    <!-- 前往抽奖弹窗 -->
    <modal :show="showDrawPop">
      <div class="draw-modal">
        <button class="close" v-throttle:click.1000="goDraw">关闭</button>
        <button class="affirm" v-throttle:click.1000="goDraw">确认</button>
      </div>
    </modal>
  </div>
</template>

<script>
import api, { handleApiRes } from '@/js/api';
import { MAP } from '@/js/utils/track';
import { track } from '@/js/utils/track/track';
import { Toast } from 'mint-ui';
import modal from '@/components/Modal/index.vue';
import ReadTaskModel from '@/components/ReadTaskModel';
import { mapMutations, mapState } from 'vuex';
export default {
  name: 'MackTea',
  components: {
    modal,
    ReadTaskModel
  },
  data() {
    return {
      // 水温
      temperature: 80,
      // 要求水温
      idealTemperature: '81-100',
      // 是否碰撞水壶
      isCrash: false,
      flag: false,
      // 记录茶叶第一次的左边距
      teaElLeftFirst: '',
      // 记录茶叶第一次的上边距
      teaElToptFirst: '',
      // 显示栓茶页面
      showMackTeaIng: false,
      // 栓茶页面的倒计时
      countDown: 3,
      // 控制前往 抽奖弹窗
      showDrawPop: false,
      showReadTaskModel: false
    };
  },
  created() {
    this.idealTemperature = this.todayTeaData.rangeTemperature;
  },

  mounted() {
    this.recordPosition();
  },
  methods: {
    ...mapMutations(['SET_UPDATA_PRIZE_EXCHANGE_STATE']),
    temperatureAdd() {
      if (this.temperature >= 100) {
        this.temperature = 100;
      } else {
        this.temperature++;
      }
    },
    temperatureSub() {
      if (this.temperature <= 0) {
        this.temperature = 0;
      } else {
        this.temperature--;
      }
    },
    // 开始泡茶动画
    startMakeTea() {
      this.$refs.kettle.classList.add('mack-anima-start');
    },
    // 开始栓茶动画
    startMackTeaIngStart() {
      setTimeout(() => {
        this.showMackTeaIng = true;
        this.$nextTick(() => {
          this.showCountDown(); // 显示栓茶倒计时
          this.$refs.mackTeaIng.classList.add('mack-tea-anima-run-start');
        });
      }, 1900);
    },
    // 栓茶倒计时
    showCountDown() {
      var timer = setInterval(() => {
        this.countDown--;
        if (this.countDown <= 0) {
          this.showMackTeaIng = false; // 关闭栓茶页
          this.showDrawPop = true;

          clearInterval(timer);
        }
      }, 1000);
    },
    // 校验水温
    checkTemperature() {
      var arr = this.idealTemperature.split('-');
      var minTemper = arr[0]; // 要求最低的水温
      var maxTemper = arr[1]; // 要求最高的水温
      if (!this.isCrash) {
        Toast({
          message: `茶叶还未放入茶杯，无法泡茶哟~`,
          position: 'center',
          duration: 3000
        });
        return;
      }
      if (this.temperature >= minTemper && this.temperature <= maxTemper) {
        console.log('水温合适');
        console.log('idididi', this.todayTeaData.id);
        this.getTeaMakeFinish(this.todayTeaData.id);
        this.startMakeTea(); // 播放泡茶动画
        this.startMackTeaIngStart(); // 播放栓茶动画
      } else {
        Toast({
          message: `水温未达到合适温度，不妨再去看看阅读茶知识吧~`,
          position: 'center',
          duration: 3000
        });
      }
      track(MAP['Fibo__btn-lijichongcha']);
    },
    recordPosition() {
      var teaEl = this.$refs.reaDom;
      this.teaElLeftFirst = teaEl.offsetLeft;
      this.teaElToptFirst = teaEl.offsetTop;
    },
    teaOnDown(e) {
      track(MAP['Fibo__btn-tuodong']);
      if (this.isCrash) return;
      e.preventDefault();
      var teaEl = this.$refs.reaDom;
      var potEl = this.$refs.potDom;
      // 茶叶左边距
      let teaElLeft = teaEl.offsetLeft;
      // 茶叶上边距
      let teaEltop = teaEl.offsetTop;
      // 茶叶宽
      let teaElWidth = teaEl.offsetWidth;
      // 茶叶高
      let teaElHeight = teaEl.offsetHeight;
      let pageWidth = document.documentElement.clientWidth;
      let pageHeight = document.documentElement.clientHeight;
      let x = e.touches[0].clientX - teaElLeft;
      let y = e.touches[0].clientY - teaEltop;
      this.moveFn = e => {
        let left = e.touches[0].clientX - x;
        let top = e.touches[0].clientY - y;

        // 边界检测
        if (left <= 0) {
          left = 0;
        } else if (left >= pageWidth - teaElWidth) {
          left = pageWidth - teaElWidth;
        }
        if (top <= 0) {
          top = 0;
        } else if (top >= pageHeight - teaElHeight) {
          top = pageHeight - teaElHeight;
        }
        teaEl.style.left = `${left}px`;
        teaEl.style.top = `${top}px`;
      };

      document.addEventListener('touchmove', this.moveFn);
      document.addEventListener('touchend', () => {
        if (this.isCrash) return;
        document.removeEventListener('touchmove', this.moveFn);
        var teaEl = this.$refs.reaDom;
        var potEl = this.$refs.potDom;
        this.crash(teaEl, potEl);
        console.log('111');
        if (!this.isCrash) {
          console.log('22');
          console.log(this.teaElLeftFirst, this.teaElToptFirst);
          teaEl.style.left = `${this.teaElLeftFirst}px`;
          teaEl.style.top = `${this.teaElToptFirst}px`;
        }
      });
    },
    // 茶叶和茶壶的碰撞
    crash(tea, pot) {
      if (this.isCrash) return;
      var softL = pot.offsetLeft - tea.offsetWidth;
      var softR = pot.offsetLeft + pot.offsetWidth;
      var softT = pot.offsetTop - tea.offsetHeight;
      var softB = pot.offsetTop + pot.offsetHeight;

      if (
        tea.offsetLeft >= softL &&
        tea.offsetLeft <= softR &&
        tea.offsetTop >= softT &&
        tea.offsetTop <= softB
      ) {
        if (!this.isCrash) {
          this.isCrash = true;
          this.flag = true;
          console.log('碰撞');
          // setTimeout(() => {
          //   document.removeEventListener('touchmove', this.moveFn);
          // }, 10);
        }
      } else {
        if (this.isCrash && !this.flag) {
          this.isCrash = false;
          console.log('没');
        }
      }
    },
    // 重新阅读
    againRead() {
      console.log('重新阅读');
      track(MAP['Fibo__btn-yueduagain']);
      // this.$router.replace({ path: '/home', query: { type: 'againread' } });
      this.showReadTaskModel = true;
      localStorage.setItem('type', 'againread');
    },
    // 前往抽奖
    goDraw() {
      track(MAP['Fibo__btn-qianwangchoujiang']);
      this.showDrawPop = false;
      this.$router.replace('/home');
      this.SET_UPDATA_PRIZE_EXCHANGE_STATE(true);
    },
    // 完成冲泡方法
    async getTeaMakeFinish(id) {
      const [infoErr, info] = await handleApiRes(api.getTeaMakeFinish(id));
      console.log('泡茶任务完成情况', 'infoErr: ', infoErr, 'info: ', info);
      if (info) {
        console.log('泡茶完成接口调用成功', info.data);
      }
    }
  },
  computed: {
    ...mapState(['todayTeaData'])
  }
};
</script>
<style lang="scss" scoped>
.mack-tea {
  position: relative;
  height: 100%;
  .mack-tea-main {
    position: relative;
    height: vw(1079);
    background: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/te-bg2.png')
      no-repeat center;
    background-size: cover;
    .mack-tea-hint {
      @include wh(219, 75);
      @include bgimage(
        'https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/tip.png'
      );
      @include lt(273, 376);
    }
    .tea {
      width: vw(176);
      height: vw(154);
      @include bgimage(
        'https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/tea-hand.png'
      );
      @include lt(214, 455);
      z-index: 3;
    }
    .pot {
      opacity: 0;
      width: vw(194);
      height: vw(179);
      @include bgimage(
        'https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/tea-hu.png'
      );
      @include lt(200, 667);
    }
    .kettle {
      @include wh(500, 520);
      @include rt(60, 330);
      z-index: 2;
      background: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/chongca.png')
        left center no-repeat;
      background-size: cover;
    }
    @keyframes mack-tea {
      from {
        background-position: 0, 0;
      }
      to {
        background-position: vw(-15000), 0;
      }
    }
    .mack-anima-start {
      animation: mack-tea 2s steps(30, start) 0s backwards;
    }
    .readTask {
      position: absolute;
      top: vw(204);
      right: 0;
      z-index: 5;
      width: vw(215);
      height: vw(310);
      background: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/panel.png')
        no-repeat center center;
      background-size: contain;
      .readTask-content {
        width: vw(215);
        height: vw(155);
        margin-top: vw(137);
        .img-warp {
          width: vw(145);
          height: vw(85);
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .hint {
          color: #874700;
          padding: vw(8) vw(8);
          text-align: center;
          transform: scale(0.85);
          font-size: vw(18);
          line-height: vw(30);
        }
      }
    }
  }
  .progress {
    @include wh(719, 198);
    @include bgimage(
      'https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/temperature.png'
    );
    // @include ct(1051);
    margin: 0 auto;
    position: sticky;
    z-index: 2;
    margin-top: vw(-28);
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: vw(57);
    padding-left: vw(3);
    button {
      opacity: 0;
      @include wh(58, 58);
    }
    .progress-show {
      color: #d93a3a;
      font-size: vw(24);
      position: absolute;
      top: vw(65);
    }
    .progress-bar {
      height: 100%;
      margin: 0 vw(15);
      @include wh(460, 50);
      padding: vw(4);
      .progress-bar-centent {
        background-image: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/temperature-centent2.png');
        // background-position: center;
        background-size: cover;
        border-radius: 3%;
        background-repeat: repeat;
        text-align: center;
        height: vw(40);
      }
    }
  }
  .start-brew-warp {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: vw(194);
    position: absolute;
    bottom: 0;
    @include bgimage(
      'https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/yun.png'
    );
    .start-brew-btn {
      @include wh(453, 156);
      background-position: center;
      background-size: contain;
      background-repeat: no-repeat;
      background-image: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/start-cp.png');
    }
  }
  .make-tea-ing {
    width: 100vw;
    height: 100%;
    position: fixed;
    top: 0;
    background-image: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/make-tea-ing.png');
    background-position: top;
    background-size: cover;
    background-repeat: no-repeat;
    z-index: 6;
    .mack-tea-anima {
      @include wh(280, 340);
      @include ct(550);
      background: url('https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/mack-tea-ing-anima.png')
        left center no-repeat;
      background-size: cover;
      z-index: 4;
    }
    @keyframes mack-tea-anima-run {
      from {
        background-position-x: 0;
      }
      to {
        background-position-x: vw(-4200);
      }
    }
    .mack-tea-anima-run-start {
      animation: mack-tea-anima-run 3s steps(15, start);
    }
    .count-down {
      color: #fff;
      font-size: vw(45);
      position: absolute;
      top: vw(380);
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .draw-modal {
    position: relative;
    @include wh(706, 961);
    @include bgimage(
      'https://apg-kangkang-tea.oss-cn-hangzhou.aliyuncs.com/apg-kangkang-tea/goDrawPop3.png'
    );
    .affirm {
      opacity: 0;
      @include wh(360, 108);
      @include ct(730);
    }
    .close {
      opacity: 0;
      @include wh(100, 100);
      @include rt(8, 65);
    }
  }
}
</style>
```
## 黄金矿工
```vue
<template>
  <div class="gold-miner" ref="miner" @click.stop="pushGrapnel">
    <div class="main">
      <!-- 面板 -->
      <div class="panel">
        <div class="top">
          <div class="target-score">
            <span></span>
            <span>{{ targetScore }}</span>
          </div>
          <div class="count-down">
            <span></span>
            <span>{{ countDown }}s</span>
          </div>
        </div>
        <div class="bottom">
          <span></span>
          <span>{{ currentScore }}</span>
        </div>
      </div>
      <!-- 卡通人物ip -->
      <!-- 使用svg做序列帧, 可以完美解决vw单位精度丢失, 导致序列帧抖动的问题 -->
      <svg viewBox="0, 0, 240, 245" class="ip-box">
        <foreignObject class="ip-main" width="240" height="245">
          <div class="ip-img" ref="ipImg"></div>
        </foreignObject>
      </svg>

      <!-- 抓钩和绳索 -->
      <div class="grapnel-box" ref="grapnelBox">
        <div class="rope" ref="rope"></div>
        <div class="grapnel" ref="grapnel">
          <div ref="inner"></div>
        </div>
      </div>

      <div class="panel-score" ref="panelScore">+{{ addScores }}</div>
    </div>
    <!-- 所有宝石 -->
    <div class="mines" ref="mines">
      <div
        v-for="(item, index) in randAllMinerals"
        :key="index"
        :style="{ backgroundImage: 'url(' + item.img + ')' }"
        :src="item.img"
        :data-index="index"
        :class="[
          { 'm-stone': item.scoreValue == 5 },
          { 'l-stone': item.scoreValue == 15 },
          { 's-mine': item.scoreValue == 50 },
          { 'm-mine': item.scoreValue == 100 },
          { 'l-mine': item.scoreValue == 300 }
        ]"
      ></div>
    </div>
  </div>
</template>

<script>
import anime from './utils/anime.min';
import randomInt from '@/rpf/un/randomInt';
export default {
  name: 'goldMinerGame',
  components: {},
  data() {
    return {
      maxiStackSize: 50,
      currentStackSize: 0,
      addScores: 0,
      // 显示是否达成目标弹窗
      showGuessFoodPop: false,
      // 整个容器Dom
      minerDom: null,
      // 抓钩Dom
      grapnelDom: null,
      // 绳索Dom
      ropeDom: null,
      // 所有矿石
      allMinerals: [
        {
          type: 'mine',
          img: require('./assets/s-mine.png'),
          pullTime: 2,
          scoreValue: 50
        },
        {
          type: 'mine',
          img: require('./assets/l-mine.png'),
          pullTime: 5,
          scoreValue: 300
        },
        {
          type: 'mine',
          img: require('./assets/m-mine.png'),
          pullTime: 3,
          scoreValue: 100
        },
        {
          type: 'mine',
          img: require('./assets/l-mine.png'),
          pullTime: 5,
          scoreValue: 300
        },
        {
          type: 'stone',
          img: require('./assets/l-stone.png'),
          pullTime: 3,
          scoreValue: 15
        },
        {
          type: 'mine',
          img: require('./assets/l-mine.png'),
          pullTime: 5,
          scoreValue: 300
        },
        {
          type: 'mine',
          img: require('./assets/l-mine.png'),
          pullTime: 5,
          scoreValue: 300
        },
        {
          type: 'stone',
          img: require('./assets/m-stone.png'),
          pullTime: 2,
          scoreValue: 5
        },
        {
          type: 'mine',
          img: require('./assets/m-mine.png'),
          pullTime: 3,
          scoreValue: 100
        },
        {
          type: 'stone',
          img: require('./assets/m-stone.png'),
          pullTime: 2,
          scoreValue: 5
        },
        {
          type: 'mine',
          img: require('./assets/m-mine.png'),
          pullTime: 3,
          scoreValue: 100
        },
        {
          type: 'stone',
          img: require('./assets/l-stone.png'),
          pullTime: 3,
          scoreValue: 15
        }
      ],

      // 当前随机矿石总分数
      currentRandScore: 0,
      // 所有随机矿石
      randAllMinerals: [],
      // 所有的矿石Dom集合
      allMineralsDoms: null,
      // 是否在拉取中
      pullIng: false,
      // 是否在发射中
      pushIng: false,
      grapnelAnite: null,
      // 绳索长度
      ropeLength: 0,
      // 拉取时的速度
      ropePullSpend: 0,
      // 目标分数
      targetScore: 600,
      // 当前分数
      currentScore: 0,
      // 倒计时
      countDown: 60,
      gameOver: false,
      allSafeMineraArr: []
    };
  },
  created() {
    // 随机目标分数
    this.targetScore = [650, 825, 1050][randomInt(0, 2)];
    // 调用随机矿石类型方法
    this.randomMinesType();
  },
  mounted() {
    this.gameInit();
    this.countDownFn();

    // 开启倒计时
  },
  methods: {
    gameInit() {
      // 获取各类Dom
      this.minerDom = this.$refs.miner;
      this.grapnelDom = this.$refs.grapnel;
      this.grapnelBoxDom = this.$refs.grapnelBox;
      this.innerDom = this.$refs.inner;
      this.ropeDom = this.$refs.rope;
      this.panelScoreDom = this.$refs.panelScore;
      this.mines = this.$refs.mines;
      this.mines.offsetHeight;
      this.mines.offsetWidth;
      this.allMineralsDoms = [...this.mines.children];

      // 设置抓钩原点
      this.grapnelBoxDom.style['transform-origin'] = 'center top';
      this.$refs.ipImg.style.animationPlayState = 'paused';
      // 初始化抓钩和绳索动画
      this.grapnelAnite = anime({
        targets: [this.grapnelBoxDom],
        duration: 5000,
        easing: 'linear',
        rotateZ: [-60, 0, 60, 0],
        loop: true
      });
      // 调用随机矿产位置方法
      this.randomLocation();
    },
    // 倒计时
    countDownFn() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.countDown <= 0) {
          clearInterval(this.timer);
          this.timer = null;
          this.isCompleteTarget(true);
        } else {
          this.countDown--;
        }
      }, 1000);
    },
    // 暂停游戏
    pauseGame() {
      this.gameOver = true;
      this.grapnelAnite?.pause();
      this.pullGrapnelAnime?.pause();
      this.pushGrapnelanime?.pause();
      this.$refs.ipImg.style.animationPlayState = 'paused';
    },
    // 校验是否完成目标
    async isCompleteTarget(timeEnd) {
      if (this.currentScore >= this.targetScore) {
        this.pauseGame();
        alert('达成目标');
        clearInterval(this.timer);
        this.timer = null;
        // 调用接口, 传递有没有猜中情况
      } else {
        if (timeEnd) {
          this.pauseGame();
          alert('未达成目标');
        }
      }
    },
    // 随机矿石类型
    randomMinesType() {
      let minera = this.allMinerals[randomInt(0, this.allMinerals.length - 1)];
      this.randAllMinerals.push(minera);
      this.currentRandScore += minera.scoreValue;
      // 当前分数大于目标分数150 就停止随机宝石(以防出现, 宝石夹完了, 分数还不够的情况)
      if (this.currentRandScore > this.targetScore + 150) return;
      this.randomMinesType();
    },
    // 随机每个矿产位置
    randomLocation() {
      this.allSafeMineraArr = [];
      this.allMineralsDoms.forEach(item => {
        let itemObj = this.randomMinesLocation({
          w: item.offsetWidth,
          h: item.offsetHeight
        });

        this.checkSafeFn(itemObj);
      });
      this.renderMinera();
    },
    // 渲染宝石
    renderMinera() {
      this.allMineralsDoms.forEach((item, index) => {
        item.style.marginLeft = this.allSafeMineraArr[index]['l'] + 'px';
        item.style.marginTop = this.allSafeMineraArr[index]['t'] + 'px';
      });
    },
    // 随机单个宝石位置
    randomMinesLocation(m) {
      let mBoxW = this.mines.offsetWidth;
      let mBoxH = this.mines.offsetHeight;
      let mL = randomInt(0, mBoxW);
      let mT = randomInt(0, mBoxH);

      let newL = mL > mBoxW - m['w'] ? mL - m['w'] : mL;
      let newT = mT > mBoxH - m['h'] ? mT - m['h'] : mT;
      return {
        l: newL,
        t: newT,
        w: m['w'],
        h: m['h']
      };
    },
    // 校验宝石安全区
    // 如果随机得宝石位置, 和别的宝石位置重叠, 则递归重新随机新位置, 直到不发生重叠
    checkSafeFn(currentItem) {
      let isCrash = false;
      let cL = currentItem['l'];
      let cT = currentItem['t'];
      let cR = cL + currentItem['w'];
      let cB = cT + currentItem['h'];

      if (this.allSafeMineraArr.length == 0) {
        this.allSafeMineraArr.push(currentItem);
        return false;
      }
      this.allSafeMineraArr?.forEach(item => {
        var iL = item['l'];
        var iT = item['t'];
        var iR = iL + item['w'];
        var iB = iT + item['h'];
        if (!(iR < cL || cR < iL || iB < cT || cB < iT)) {
          isCrash = true;
          return;
        }
      });

      if (isCrash) {
        this.newLoation = this.randomMinesLocation(currentItem);
        this.checkSafeFn(this.newLoation);
      } else {
        if (this.newLoation) {
          this.allSafeMineraArr.push(this.newLoation);
        } else {
          this.allSafeMineraArr.push(currentItem);
        }
        this.newLoation = '';
      }
    },
    // 获取抓钩旋转角度方法
    getRotateValue() {
      let st = window.getComputedStyle(this.grapnelBoxDom, null);
      let tr = st.getPropertyValue('transform');
      let values = tr.split('(')[1].split(')')[0].split(',');
      let a = values[0];
      let b = values[1];
      let rotate = Math.round(Math.atan2(b, a) * (180 / Math.PI));
      return Math.abs(rotate - 0);
    },
    // 根据钩子角度调整钩子长度(实现钩子越往屏幕内就越短)
    setRopeLength() {
      let rotate = this.getRotateValue();
      // 初始化一次钩子长度
      this.ropeLength =
        this.minerDom.offsetHeight - this.grapnelDom.offsetHeight;
      // 根据钩子角度动态设置一次钩子长度
      this.ropeLength =
        rotate > 15
          ? (this.ropeLength -= rotate * 8)
          : this.minerDom.offsetHeight - this.grapnelDom.offsetHeight;
    },
    // 检测钩子是否与矿石碰撞
    checkCrash(callBackFn) {
      var gL = parseFloat(this.grapnelDom.getBoundingClientRect().left + 17);
      var gT = parseFloat(this.grapnelDom.getBoundingClientRect().top) + 30;
      var gR = gL + this.grapnelDom.offsetWidth - 24;
      var gB = gT + this.grapnelDom.offsetHeight - 46;
      this.allMineralsDoms.forEach(miner => {
        var mL = parseFloat(miner.getBoundingClientRect().left);
        var mT = parseFloat(miner.getBoundingClientRect().top);
        var mR = mL + miner.offsetWidth;
        var mB = mT + miner.offsetHeight;
        if (!(mR < gL || gR < mL || mB < gT || gB < mT) && !this.pullIng) {
          this.innerDom.style.width = miner.offsetWidth + 'px';
          this.innerDom.style.height = miner.offsetHeight + 'px';
          this.innerDom.style.backgroundImage = miner.style.backgroundImage;
          this.pullIng = true;
          callBackFn(miner);
          return;
        }
      });
    },
    addScore() {
      if (!this.minerObj) return;
      this.panelScoreDom.classList?.add('panel-score-play');
      this.addScores = this.minerObj.scoreValue;
      this.currentScore += this.minerObj.scoreValue;
      this.minerObj = '';
      this.isCompleteTarget(false);
    },
    // 发射钩子
    pushGrapnel() {
      this.$refs.ipImg.style.animationPlayState = 'running';
      this.panelScoreDom.classList?.remove('panel-score-play');
      this.$refs.ipImg.classList.add('ip-animation-start');
      if (this.pushIng || this.gameOver) return;
      this.pushIng = true;
      this.ropePullSpend = 1000;
      this.setRopeLength();
      this.grapnelAnite.pause();
      this.pushGrapnelanime = anime
        .timeline({
          easing: 'linear',
          duration: '1000',
          endDelay: 100
        })
        .add(
          {
            targets: this.grapnelDom,
            translateY: this.ropeLength,
            change: () => {
              this.checkCrash(currentMiner => {
                this.pushGrapnelanime.pause();
                currentMiner.style['display'] = 'none';
                this.minerObj =
                  this.randAllMinerals[currentMiner.dataset.index];
                // 添加分数
                this.innerDom.style.backgroundImage = `url(${this.minerObj.img})`;
                // 设置拉取速度
                this.ropePullSpend = this.minerObj['pullTime'] * 1000;
                this.grapnelDom.classList.add('grapnel-animation-paly');
                setTimeout(() => {
                  this.pullGrapnel();
                }, 700);
              });
            },
            complete: () => {
              this.pullGrapnel();
            }
          },
          0
        )
        .add(
          {
            targets: this.ropeDom,
            height: [0, this.ropeLength + 12]
          },
          0
        );
    },
    // 拉取钩子
    pullGrapnel() {
      this.pullGrapnelAnime = anime
        .timeline({
          easing: 'linear',
          duration: this.ropePullSpend
        })
        .add(
          {
            targets: this.grapnelDom,
            translateY: 0,
            complete: () => {
              this.grapnelDom.classList.remove('grapnel-animation-paly');
              this.$refs.ipImg.style.animationPlayState = 'paused';
              this.pushIng = false;
              this.pullIng = false;
              this.innerDom.style.backgroundImage = '';
              this.grapnelAnite.play();
              this.addScore();
            }
          },
          0
        )
        .add(
          {
            targets: this.ropeDom,
            height: 6
          },
          0
        );
    }
  }
};
</script>
<style lang="scss" scoped>
.gold-miner {
  .main {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    height: vw(550);
  }
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  align-content: center;
  flex-wrap: wrap;
  height: 100vh;
  background-image: url('./assets/goldminer-bg.jpg');
  background-size: cover;
  .panel-score {
    position: absolute;
    left: vw(150);
    top: vw(280);
    color: #fff;
    font-size: vw(52);
    opacity: 0;
  }
  @keyframes panel-score {
    from {
      top: vw(280);
      opacity: 0.85;
    }
    to {
      top: vw(170);
      opacity: 0;
    }
  }
  .panel-score-play {
    animation: panel-score 0.8s;
  }
  .grapnel-box {
    top: vw(386);
    margin-left: vw(-28);
    position: fixed;
    display: flex;
    flex-direction: column;
    align-items: center;
    .rope {
      top: vw(4);
      width: vw(10);
      margin-left: vw(-1);
      z-index: 2;
      position: absolute;
      background-image: linear-gradient(to right, #c08555, #5c3110);
      background-color: #c08555;
    }
    .grapnel {
      width: vw(130);
      height: vw(92);
      z-index: 2;
      top: 0;
      left: 0;
      margin-left: vw(-6);
      background-image: url('./assets/grapnel.png');
      // background-position: left center;
      background-size: cover;
      display: flex;
      justify-content: center;
      padding-top: vw(30);
      div {
        position: absolute;
        background-repeat: no-repeat;
        background-size: contain;
      }
    }

    @keyframes grapnel-animation {
      from {
        background-position-x: 0;
      }
      to {
        background-position-x: vw(-780);
      }
    }
    .grapnel-animation-paly {
      animation: grapnel-animation 0.4s steps(6) forwards;
    }
  }

  .panel {
    height: vw(170);
    color: #ffffff;
    padding: vw(50) vw(50) 0;
    width: 100%;
    .top {
      display: flex;
      justify-content: space-between;
      margin-bottom: vw(38);
    }
    .target-score,
    .count-down,
    .bottom {
      display: flex;
      align-items: center;
    }
    .count-down {
      span {
        &:first-child {
          background-image: url('./assets/goldminer-time.png');
        }
      }
    }
    .bottom {
      span {
        &:first-child {
          background-image: url('./assets/goldminer-current.png');
        }
      }
    }
    span {
      display: inline-block;
      &:first-child {
        background-image: url('./assets/goldminer-target.png');
      }
      &:last-child {
        color: #5c2f26;
        font-size: vw(30);
        width: vw(147);
        height: vw(40);
        background-color: #c8bbba;
        line-height: vw(40);
        text-align: center;
        border-radius: vw(20);
        margin-left: vw(6);
      }
    }
  }
  .ip-box {
    position: absolute;
    width: vw(260);
    height: vw(275);
    top: vw(160);
  }
  .ip-main {
    width: 240px;
    height: 245px;
  }
  .ip-img {
    width: 4320px;
    height: 245px;
    background: url('./assets/goldminer-ip.png') 0 0 no-repeat;
    background-size: 4320px 245px;
    animation: ip-animation 1.3s steps(18) infinite;
  }
  @keyframes ip-animation {
    from {
      background-position-x: 0;
    }
    to {
      background-position-x: -4320px;
    }
  }

  .mines {
    flex: 1;
    width: 100%;

    div {
      object-fit: contain;
      z-index: 2;
      position: absolute;
      background-size: contain;
      background-repeat: no-repeat;
    }
    .m-stone {
      width: vw(104);
      height: vw(90);
    }
    .l-stone {
      width: vw(130);
      height: vw(105);
    }
    .s-mine {
      width: vw(63);
      height: vw(73);
    }
    .m-mine {
      width: vw(80);
      height: vw(104);
    }
    .l-mine {
      width: vw(100);
      height: vw(140);
    }
  }
  .btn {
    cursor: pointer;
    position: absolute;
    right: 0;
    text-align: center;
    line-height: 30px;
    width: 80px;
    height: 30px;
    font-size: 15px;
    float: right;
    border-radius: 20px;
    background-color: black;
    color: #ffffff;
  }
}
</style>
```
## 进度条

- 主体 Loading/index.vue
  ```vue
  <template>
    <ImgPreload
      :imgs="preloadImgs"
      @finish="imgPreloadFinish"
      @error="imgPreloadError"
      class="progress-bar"
    >
      <template v-slot="{ loaded, total }">
        <div class="progress-warp">
          <div
            class="progress-inner"
            :style="`width: ${Math.floor(loaded / total) * 100}%;`"
          ></div>
          <div class="progress-percent">
            {{ Math.floor(loaded / total) * 100 }}%
          </div>
        </div>
      </template>
    </ImgPreload>
  </template>
  
  <script setup lang="ts">
  import ImgPreload from '@/rpf/vue/components/ImgPreload';
  
  const importAll = r => Object.values(r).map((v: any) => v.default);
  const preloadImgs = importAll(
    import.meta.glob('./../../assets/images/**/*.(png|jpg|gif|jpeg|webp|ico)', {
      eager: true
    })
  );
  
  const imgPreloadFinish = () => {
    console.log('图片加载完成');
  };
  const imgPreloadError = err => {
    console.log('图片加载出错', err);
  };
  </script>
  
  <style lang="scss" scoped>
  .progress-bar {
    width: 100vw;
    height: 100vh;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    .progress-warp {
      position: relative;
      width: 300px;
      height: 20px;
      background-color: #d6eec3;
      border-radius: 10px;
      .progress-inner {
        font-size: 14px;
        position: absolute;
        height: 100%;
        background-color: #e46225;
        border-radius: 10px;
      }
      .progress-percent {
        position: absolute;
        font-size: 16px;
        top: 30px;
        left: 50%;
        transform: translate(-50%);
      }
    }
  }
  </style>
  ```
  
- 依赖的组件 ImgPreload/index.vue

  ```vue
  <template>
    <div>
      <slot v-bind:loaded="loaded" v-bind:total="total"></slot>
    </div>
  </template>
  
  <script>
  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = reject;
      img.src = src;
    });
  }
  
  export default {
    name: 'ImgPreload',
    props: {
      imgs: {
        type: Array,
        required: true,
        default: () => []
      }
    },
    data() {
      return {
        loaded: 0
      };
    },
    computed: {
      preloadImgs() {
        return this.imgs.filter(item => !/^data/.test(item));
      },
      total() {
        return this.preloadImgs.length;
      }
    },
    mounted() {
      if (!this.preloadImgs.length) {
        this.$emit('finish');
        return;
      }
      for (let i = 0; i < this.preloadImgs.length; i++) {
        loadImg(this.preloadImgs[i])
          .then(() => {
            console.log('loaded', this.loaded);
            this.loaded += 1;
            this.$nextTick(() => {
              if (this.loaded >= this.preloadImgs.length) {
                this.$emit('finish');
              }
            });
          })
          .catch(err => {
            this.$emit('error', err);
          });
      }
    }
  };
  </script>
  ```
## 兼容h5的序列帧动画

  - 一个可以兼容所有移动设备的序列帧动画, 可以彻底解决序列帧漂移问题
  ```vue
<template>
  <div class="animate">
    <svg viewBox="0, 0, 160, 220" class="animate-box">
      <foreignObject class="animate-main" width="160" height="220">
        <div class="animate-centent" ref="ipImg"></div>
      </foreignObject>
    </svg>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
/* svg 需要写小写px单位, 这样能被 postcss.config 自动转化为vw单位 */
.animate-box {
  width: 160px;
  height: 220px;

  /* 动画这里需要使用大写的PX单位, 这样就是正常使用px, 不会被转化为VW单位 */
  .animate-centent {
    /** 大写的px不会被postcss.config转化为vw单位 */
    /* 格式化代码时, 会被vscode把大写PX转化为小写的, 所以需要加上 prettier-ignore */
    /* prettier-ignore */
    width: 160PX;
    /* prettier-ignore */
    height: 220PX;
    background-image: url('@/assets/animate.png');
    background-position: left center;
    background-size: cover;
    background-repeat: no-repeat;
    animation: animate 0.7s steps(20) infinite;
  }
  @keyframes animate {
    from {
      background-position-x: 0;
    }
    to {
      /* 这里使用大写PX单位 */
      /* prettier-ignore */
      background-position-x: -3200PX;
    }
  }
}
</style>
  ```
## 监听序列帧动画结束的方法
```js
  const animate = document.getElementById('animate')
  const animateEnd = () => {
    animate.addEventListener('animationend', () => {
      console.log('动画结束')
      state.animateEnd = true;
    });
  };
```
## h5下滑切换页面效果
### 路由部分
```js
import { createRouter, createWebHashHistory } from 'vue-router';
import page1 from '@/views/TogglePage1.vue';
import page2 from '@/views/TogglePage2.vue';
import page3 from '@/views/TogglePage3.vue';
import page4 from '@/views/TogglePage4.vue';
import page5 from '@/views/TogglePage5.vue';
import page6 from '@/views/TogglePage6.vue';
const routes = [
  {
    path: '/page1',
    name: 'page1',
    component: page1
  },
  {
    path: '/page2',
    name: 'page2',
    component: page2
  },
  {
    path: '/page3',
    name: 'page3',
    component: page3
  },
  {
    path: '/page4',
    name: 'page4',
    component: page4
  },
  {
    path: '/page5',
    name: 'page5',
    component: page5
  },
  {
    path: '/page6',
    name: 'page6',
    component: page6
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;

```

### 每个page页面内容
```js
<template>
  <div class="page1">
    <div class="page1-content">
      <div class="page1-title">页面1</div>
      <button class="page1-btn" @click="$router.push('/page2')">切换</button>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.page1 {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: rgb(194, 193, 104);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

```

### app路由动画部分

```js
<template>
  <router-view v-slot="{ Component }">
    <transition name="trans">
      <component :is="Component" />
    </transition>
  </router-view>
  <ImageLoad />
</template>

<script setup lang="ts">
import ImageLoad from '@/components/ImageLoad.vue';

</script>

<style scoped lang="scss">
.trans-enter-active,
.trans-leave-active {
  transition: all 0.5s;
}

.trans-enter-to,
.trans-leave-from {
  transform: translateY(0%);
}
.trans-enter-from {
  transform: translateY(100%);
}
.trans-leave-to {
  transform: translateY(-100%);
}
</style>

```