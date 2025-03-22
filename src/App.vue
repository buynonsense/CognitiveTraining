<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 创建全局背景音乐控制
const bgmPlaying = ref(true) // 改为默认true
const bgm = uni.createInnerAudioContext()

// 设置BGM
function initBGM() {
  bgm.src = '/static/audio/background.m4a'
  bgm.loop = true
  bgm.autoplay = true // 默认自动播放
  
  bgm.onError((res) => {
    console.error('BGM播放错误:', res.errMsg)
  })
  
  bgm.onEnded(() => {
    if (bgm.loop === false) {
      bgmPlaying.value = false
    }
  })
}

function playBGM() {
  bgm.play()
  bgmPlaying.value = true
}

function pauseBGM() {
  bgm.pause()
  bgmPlaying.value = false
}

function toggleBGM() {
  if (bgmPlaying.value) {
    pauseBGM()
  } else {
    playBGM()
  }
  return bgmPlaying.value
}

// 将BGM控制器暴露给全局
uni.$bgm = {
  play: playBGM,
  pause: pauseBGM,
  toggle: toggleBGM,
  isPlaying: () => bgmPlaying.value
}

onLaunch(() => {
  initBGM()
  // 确保开始就是播放状态
  playBGM()
})

onShow(() => {
  if (bgmPlaying.value) {
    playBGM()
  }
})

onHide(() => {
  // 页面隐藏时不暂停BGM，让它继续在后台播放
})
</script>

<style></style>
