<template>
  <view class="container">
    <!-- 添加BGM控制组件 -->
    <BgmControl />
    
    <view class="header">
      <view class="title">认知训练-数字划消</view>
      <view class="divider"></view>
      <view class="english-title">Cognitive Training-Digit cancellation</view>
    </view>
    <view class="btn-container">
      <wd-button type="primary" size="large" class="start-btn" @click="startTraining">开始</wd-button>
    </view>
  </view>
</template>

<script>
import BgmControl from '@/components/BgmControl.vue'

export default {
  components: {
    BgmControl
  },
  data() {
    return {};
  },
  methods: {
    startTraining() {
      // 直接跳转到用户信息页面
      uni.navigateTo({
        url: '/pages/userInfo/userInfo'
      });
    }
  }
};
</script>

<style>
/* 调整容器布局，优化空间分配 */
.container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
  box-sizing: border-box;
}

/* 优化标题区域布局和间距 */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12vh; /* 减小上边距，为标题腾出更多空间 */
  width: 100%;
}

/* 调整中文标题大小和行高 */
.title {
  font-size: 56rpx; /* 从72rpx减小到56rpx */
  font-weight: bold;
  color: #333;
  letter-spacing: 2rpx; /* 减小字间距 */
  margin-bottom: 20rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  text-align: center;
  line-height: 1.3; /* 添加行高控制 */
}

.divider {
  width: 180rpx;
  height: 6rpx;
  background-color: #409EFF;
  border-radius: 3rpx;
  margin: 10rpx 0 15rpx; /* 调整上下间距 */
}

.english-title {
  font-size: 30rpx; /* 从36rpx减小到30rpx */
  color: #666;
  letter-spacing: 1rpx; /* 减小字间距 */
  font-style: italic;
  text-align: center;
  line-height: 1.2; /* 添加行高控制 */
}

.btn-container {
  width: 90%;
  display: flex;
  justify-content: center;
  margin-bottom: 15vh; /* 减小底部边距 */
}

.start-btn {
  width: 90%;
  height: 100rpx;
  font-size: 38rpx;
  letter-spacing: 4rpx;
  border-radius: 50rpx;
  box-shadow: 0 6rpx 16rpx rgba(34, 197, 94, 0.3);
}

@media screen and (max-height: 600px) {
  .header {
    margin-top: 8vh;
  }
  
  .title {
    font-size: 48rpx;
  }
  
  .english-title {
    font-size: 26rpx;
  }
  
  .btn-container {
    margin-bottom: 10vh;
  }
}
</style>