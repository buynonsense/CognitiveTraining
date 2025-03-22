<template>
  <view @click="toggleBGM" class="bgm-control">
    {{ isPlaying ? '🔊' : '🔇' }}
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isPlaying = ref(true) // 默认开启

onMounted(() => {
  // 检查初始状态，保持与全局BGM状态一致
  isPlaying.value = uni.$bgm?.isPlaying() !== false
})

// 切换播放状态
function toggleBGM() {
  isPlaying.value = uni.$bgm?.toggle() || false
}
</script>

<style>
.bgm-control {
  position: fixed;
  top: 20rpx;
  right: 20rpx;
  z-index: 999;
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.bgm-icon {
  width: 40rpx;
  height: 40rpx;
}
</style>