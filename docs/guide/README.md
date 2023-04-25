::: demo
```vue
<!-- loading -->
<template>
  <!-- 倒计时 -->
  <div class="count-down">
    <div class="count-down-tip">
      <div class="hr">
        {{ clock.hr }}
      </div>
      <div class="min">
        {{ clock.min }}
      </div>
      <div class="sec">
        {{ clock.sec }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'countDown',
  data() {
    return {
      clock: {
        hr: '---',
        min: '---',
        sec: '---'
      },
      // 剩余时间
      ramainingTime: null
    };
  },

  props: {
    starTime: {
      type: [String, Number, Date],
      default: Date.now() + 1
    },
    endTime: {
      type: [String, Number, Date],
      default: new Date().setHours(23, 59, 59, 999)
    }
  },

  mounted() {},
  computed: {
    changeData() {
      const { starTime, endTime } = this;
      return {
        starTime,
        endTime
      };
    }
  },
  watch: {
    changeData: {
      handler() {
        this.ramainingTime = this.endTime - this.starTime;
        this.countdown();
      },
      immediate: true
    }
  },

  methods: {
    countdown() {
      if (this.ramainingTime < 0) return;
      this.clock = this.dateFormat(this.ramainingTime);

      if (this.ramainingTime <= 1000) return;

      setTimeout(() => {
        this.ramainingTime -= 1000;
        this.countdown();
      }, 1000);
    },
    dateFormat(down_time) {
      // 总的秒数
      const second = Math.floor(down_time / 1000);

      // 小时位
      let hr = Math.floor(second / 3600);
      hr = hr < 10 ? '0' + hr : hr;

      // 分钟位
      let min = Math.floor((second - hr * 3600) / 60);
      min = min < 10 ? '0' + min : min;

      // 秒位
      let sec = Math.floor(second - hr * 3600 - min * 60);
      sec = sec < 10 ? '0' + sec : sec;

      return {
        hr,
        min,
        sec
      };
    }
  }
};
</script>
<style lang="scss" scoped>
@function vw($x, $vpw: 750) {
  @return ($x / $vpw * 100) * 1vw;
}
.count-down-tip {
  background-image: url("~@/count-down-tip.png");
  width: 200px;
  height: 300px;
  background-size: 100% 100%;
  font-size: vw(24);
  font-weight: 500;
  color: #dc7f4a;
  .hr {
    position: absolute;
    left: vw(237);
    top: vw(13);
  }
  .min {
    position: absolute;
    right: vw(148);
    top: vw(13);
  }
  .sec {
    position: absolute;
    right: vw(69);
    top: vw(13);
  }
}
</style>

```
<!-- 忽略上一行的空格 -->
:::