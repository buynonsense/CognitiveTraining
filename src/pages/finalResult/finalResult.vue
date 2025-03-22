<template>
    <view class="container">
        <!-- 添加BGM控制组件 -->
        <BgmControl />
        
        <view class="header">
            <view class="title">训练完成</view>
            <view class="subtitle">您已完成全部24次认知训练</view>
        </view>

        <!-- 添加用户信息卡片 -->
        <view class="user-info-card" v-if="userInfo">
            <view class="user-info-title">用户信息</view>
            <view class="user-info-item">
                <text class="info-label">姓名：</text>
                <text class="info-value">{{ userInfo.name }}</text>
            </view>
            <view class="user-info-item">
                <text class="info-label">出生日期：</text>
                <text class="info-value">{{ userInfo.birthDate }}</text>
            </view>
            <view class="user-info-item">
                <text class="info-label">性别：</text>
                <text class="info-value">{{ userInfo.gender }}</text>
            </view>
            <view class="user-info-item">
                <text class="info-label">电话：</text>
                <text class="info-value">{{ userInfo.phone }}</text>
            </view>
            <view class="user-info-item" v-if="userInfo.occupation">
                <text class="info-label">职业：</text>
                <text class="info-value">{{ userInfo.occupation }}</text>
            </view>
            <view class="user-info-item" v-if="userInfo.education">
                <text class="info-label">学历：</text>
                <text class="info-value">{{ userInfo.education }}</text>
            </view>
            <view class="user-info-item" v-if="userInfo.educationExp">
                <text class="info-label">教育经历：</text>
                <text class="info-value">{{ userInfo.educationExp }}</text>
            </view>
        </view>

        <view class="result-card">
            <view class="avatar-section">
                <view class="avatar-container">
                    <view class="avatar">✓</view>
                </view>
            </view>

            <view class="score-section">
                <view class="total-score">{{ progress.totalScore }}<text class="score-max">/18</text></view>
                <view class="score-label">总分</view>
            </view>

            <view class="evaluation-section">
                <view class="evaluation-item">
                    <text class="evaluation-label">记忆能力</text>
                    <view class="evaluation-result" :style="{ backgroundColor: memoryResult.color }">
                        {{ memoryResult.level }}
                    </view>
                    <text class="evaluation-desc">{{ memoryResult.description }}</text>
                </view>

                <view class="divider"></view>

                <view class="evaluation-item">
                    <text class="evaluation-label">记忆提升</text>
                    <view class="evaluation-result" :style="{ backgroundColor: improvementResult.color }">
                        {{ improvementResult.level }}
                    </view>
                    <text class="evaluation-desc">记忆提升幅度：{{ improvementResult.avgRatio }}%</text>
                    <text class="evaluation-desc">{{ improvementResult.description }}</text>
                </view>
            </view>
        </view>

        <view class="btn-container">
            <wd-button type="primary" @click="startNewTraining" class="action-btn primary-btn">开始新训练</wd-button>
            <wd-button plain @click="backToHome" class="action-btn secondary-btn">返回首页</wd-button>
        </view>
    </view>
</template>

<script>
import {
    getTrainingProgress,
    resetTraining,
    evaluateMemory,
    evaluateImprovement,
    initializeTraining
} from '@/utils/patternUtils';
import BgmControl from '@/components/BgmControl.vue'

export default {
    components: {
        BgmControl
    },
    data() {
        return {
            userInfo: null,
            progress: {
                currentRound: 4,
                completedCount: 24,
                totalScore: 0,
                firstRoundScores: {},
                firstAppearanceTimes: {}
            },
            memoryResult: {
                level: '',
                description: '',
                color: ''
            },
            improvementResult: {
                level: '',
                description: '',
                color: '',
                avgRatio: 0
            }
        };
    },
    onLoad() {
        // 获取用户信息
        this.userInfo = uni.getStorageSync('userInfo');

        // 获取训练进度
        const progress = getTrainingProgress();
        if (progress) {
            this.progress = progress;
        }

        // 评估记忆能力
        this.memoryResult = evaluateMemory(this.progress.totalScore);

        // 获取计算好的记忆提升数据
        const memoryImprovement = uni.getStorageSync('memoryImprovement');
        if (memoryImprovement) {
            this.improvementResult = memoryImprovement;
        } else {
            // 如果没有计算好的数据，尝试手动计算
            const firstAppearanceTimes = Object.values(this.progress.firstAppearanceTimes || {});
            const fourthRoundTimes = uni.getStorageSync('fourthRoundTimes') || {};
            const fourthRoundTimeValues = Object.values(fourthRoundTimes);

            if (firstAppearanceTimes.length > 0 && fourthRoundTimeValues.length > 0) {
                this.improvementResult = evaluateImprovement(firstAppearanceTimes, fourthRoundTimeValues);
            } else {
                this.improvementResult = {
                    level: '数据不完整',
                    description: '无法评估记忆提升情况',
                    color: '#666666',
                    avgRatio: 0
                };
            }
        }

        // 保存训练结果
        uni.setStorageSync('finalTrainingResult', {
            userInfo: this.userInfo,
            totalScore: this.progress.totalScore,
            memoryResult: this.memoryResult,
            improvementResult: this.improvementResult,
            completedAt: Date.now()
        });
    },
    methods: {
        startNewTraining() {
            // 重置并开始新的训练，但保留用户信息
            resetTraining();
            initializeTraining();

            uni.reLaunch({
                url: '/pages/selection/selection'
            });
        },
        backToHome() {
            uni.reLaunch({
                url: '/pages/index/index'
            });
        }
    }
};
</script>

<style>
.container {
    padding: 40rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 100vh;
    background-color: #f6f8fa;
}

/* 添加用户信息卡片样式 */
.user-info-card {
    width: 92%;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
    padding: 30rpx;
    margin-bottom: 30rpx;
}

.user-info-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 20rpx;
    border-bottom: 1px solid #eee;
    padding-bottom: 10rpx;
}

.user-info-item {
    display: flex;
    margin-bottom: 15rpx;
    font-size: 28rpx;
    line-height: 1.5;
}

.info-label {
    color: #666;
    width: 180rpx;
}

.info-value {
    color: #333;
    flex: 1;
}

.header {
    width: 100%;
    margin-bottom: 60rpx;
    text-align: center;
}

.title {
    font-size: 46rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
}

.subtitle {
    font-size: 28rpx;
    color: #666;
}

.result-card {
    width: 92%;
    background-color: #fff;
    border-radius: 20rpx;
    box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.05);
    padding: 40rpx 0;
    margin-bottom: 60rpx;
    overflow: hidden;
}

.avatar-section {
    display: flex;
    justify-content: center;
    margin-bottom: 30rpx;
}

.avatar-container {
    width: 140rpx;
    height: 140rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #42b883, #35495e);
    display: flex;
    align-items: center;
    justify-content: center;
}

.avatar {
    color: white;
    font-size: 80rpx;
    font-weight: bold;
}

.score-section {
    text-align: center;
    margin-bottom: 40rpx;
}

.total-score {
    font-size: 80rpx;
    font-weight: bold;
    color: #333;
    line-height: 1;
}

.score-max {
    font-size: 36rpx;
    color: #999;
    font-weight: normal;
}

.score-label {
    font-size: 28rpx;
    color: #666;
    margin-top: 10rpx;
}

.evaluation-section {
    padding: 0 40rpx;
}

.evaluation-item {
    padding: 30rpx 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.evaluation-label {
    font-size: 30rpx;
    color: #666;
    margin-bottom: 20rpx;
}

.evaluation-result {
    padding: 12rpx 40rpx;
    border-radius: 30rpx;
    color: white;
    font-size: 32rpx;
    font-weight: bold;
    margin-bottom: 20rpx;
}

.evaluation-desc {
    font-size: 26rpx;
    color: #666;
    text-align: center;
    line-height: 1.6;
    margin-bottom: 10rpx;
}

.divider {
    height: 1px;
    background-color: #eee;
    width: 100%;
}

.btn-container {
    width: 92%;
    margin-top: 40rpx;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 20rpx;
}

.action-btn {
    flex: 1;
    height: 90rpx;
    font-size: 32rpx;
    border-radius: 45rpx;
}

.primary-btn {
    background-color: #42b883;
}

.secondary-btn {
    background-color: transparent;
    border: 1px solid #ddd;
    color: #666;
}
</style>