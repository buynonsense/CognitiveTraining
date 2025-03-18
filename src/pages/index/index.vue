<template>
  <view class="container">
    <view class="header">
      <view class="title">认知训练</view>
      <view class="divider"></view>
      <view class="english-title">Cognitive Training</view>
    </view>
    <view class="btn-container">
      <wd-button type="primary" size="large" class="start-btn" @click="startTraining">开始</wd-button>
    </view>
  </view>
</template>

<script>
import { resetTraining } from '@/utils/patternUtils';

export default {
  data() {
    return {};
  },
  methods: {
    startTraining() {
      // 重置并跳转到选择图形页面
      resetTraining();

      // 进入选择图形页面
      uni.navigateTo({
        url: '/pages/selection/selection'
      });
    }
  }
};
</script>

<style>
.container {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100vh;
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 15vh;
}

.title {
  font-size: 72rpx;
  font-weight: bold;
  color: #333;
  letter-spacing: 4rpx;
  margin-bottom: 20rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.divider {
  width: 200rpx;
  height: 6rpx;
  background-color: #409EFF;
  border-radius: 3rpx;
  margin-bottom: 20rpx;
}

.english-title {
  font-size: 36rpx;
  color: #666;
  letter-spacing: 2rpx;
  font-style: italic;
}

.btn-container {
  width: 90%;
  display: flex;
  justify-content: center;
  margin-bottom: 20vh;
}

.start-btn {
  width: 90%;
  height: 100rpx;
  font-size: 38rpx;
  letter-spacing: 4rpx;
  border-radius: 50rpx;
  box-shadow: 0 6rpx 16rpx rgba(64, 158, 255, 0.3);
}
</style>