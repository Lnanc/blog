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
# 碰撞检测
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

