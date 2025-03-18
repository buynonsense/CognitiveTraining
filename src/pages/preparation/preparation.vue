<template>
    <view class="container">
        <view class="title">记忆训练</view>
        <view class="subtitle">请记住以下图形的形状和数字</view>

        <view class="progress-info">
            <text>当前进度: {{ progress.completedCount + 1 }}/18</text>
            <text>第{{ progress.currentRound }}轮训练</text>
        </view>

        <view class="pattern-container">
            <view class="pattern-grid" v-if="pattern">
                <view v-for="(cell, index) in 25" :key="index" class="grid-cell"
                    :class="{ 'selected': pattern.cells.includes(index) }">
                    {{ pattern.numbers[index] }}
                </view>
            </view>
        </view>

        <view class="timer" v-if="showTimer">
            <text>请在 {{ remainingTime }} 秒内记忆</text>
        </view>

        <view class="btn-container">
            <wd-button type="primary" class="btn" @click="startTraining">准备好了</wd-button>
        </view>
    </view>
</template>

<script>
import { getCurrentPattern, getTrainingProgress } from '@/utils/patternUtils';

export default {
    data() {
        return {
            pattern: null,
            showTimer: true,
            remainingTime: 20,
            timer: null,
            progress: {
                currentRound: 1,
                completedCount: 0
            }
        };
    },
    onLoad() {
        console.log('准备页面加载');

        // 获取当前训练进度
        this.progress = getTrainingProgress();
        console.log('当前训练进度:', this.progress);

        // 获取当前要展示的图案
        this.pattern = getCurrentPattern();
        console.log('当前训练图案:', this.pattern);

        if (!this.pattern) {
            console.error('没有获取到有效的训练图案');
            uni.showToast({
                title: '训练已完成或数据异常',
                icon: 'none'
            });
            setTimeout(() => {
                uni.reLaunch({
                    url: '/pages/index/index'
                });
            }, 1500);
            return;
        }

        // 保存当前图案以供训练页面使用
        uni.setStorageSync('selectedPattern', this.pattern);

        this.startTimer();
    },
    onUnload() {
        this.clearTimer();
    },
    methods: {
        startTraining() {
            this.clearTimer();

            // 记录开始训练的时间
            uni.setStorageSync('trainingStartTime', Date.now());

            // 跳转到训练页面
            uni.navigateTo({
                url: '/pages/training/training'
            });
        },
        startTimer() {
            this.timer = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime--;
                } else {
                    this.clearTimer();
                    // 自动开始训练
                    this.startTraining();
                }
            }, 1000);
        },
        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }
};
</script>

<style>
.container {
    padding: 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20rpx;
}

.subtitle {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 30rpx;
}

.progress-info {
    display: flex;
    justify-content: space-between;
    width: 80%;
    margin-bottom: 30rpx;
    font-size: 28rpx;
    color: #666;
}

.pattern-container {
    width: 80%;
    margin-bottom: 60rpx;
}

.pattern-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 4rpx;
}

.grid-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    background-color: #f8f8f8;
    border-radius: 6rpx;
}

.selected {
    background-color: #409EFF;
    color: white;
}

.timer {
    margin-bottom: 60rpx;
    font-size: 32rpx;
    color: #ff4d4f;
}

.btn-container {
    width: 80%;
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.btn {
    width: 100%;
}
</style>