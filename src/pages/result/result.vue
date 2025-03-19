<template>
    <view class="container">
        <view class="title">训练结果</view>

        <view class="result-card">
            <view class="result-item">
                <text class="label">用时：</text>
                <text class="value">{{ result.timeUsed }}秒</text>
            </view>

            <view class="result-item">
                <text class="label">正确率：</text>
                <text class="value">{{ result.accuracy }}%</text>
            </view>

            <view class="result-item">
                <text class="label">得分：</text>
                <text class="value">{{ result.score }}分</text>
            </view>

            <view class="result-item">
                <text class="label">评估：</text>
                <text class="value" :style="{ color: evaluationColor }">{{ evaluation }}</text>
            </view>
        </view>

        <view class="grid-comparison">
            <view class="grid-container">
                <view class="grid-title">正确图形</view>
                <view class="pattern-grid">
                    <view v-for="(cell, index) in 25" :key="index" class="grid-cell"
                        :class="{ 'correct': result.correctCells.includes(index) }">
                        {{ gridNumbers[index] }}
                    </view>
                </view>
            </view>

            <view class="grid-container">
                <view class="grid-title">您的选择</view>
                <view class="pattern-grid">
                    <view v-for="(cell, index) in 25" :key="index" class="grid-cell" :class="{
                        'selected': result.selectedCells.includes(index),
                        'correct': result.correctCells.includes(index) && result.selectedCells.includes(index),
                        'wrong': !result.correctCells.includes(index) && result.selectedCells.includes(index)
                    }">
                        {{ gridNumbers[index] }}
                    </view>
                </view>
            </view>
        </view>

        <view class="btn-container">
            <wd-button type="primary" @click="continueTraining">
                {{ isLastTraining ? '查看结果' : '再次训练' }}
            </wd-button>
            <wd-button type="info" class="btn" @click="backToHome">返回首页</wd-button>
        </view>
    </view>
</template>

<script>
import { isTrainingCompleted, getTrainingProgress } from '@/utils/patternUtils';

export default {
    data() {
        return {
            result: {
                timeUsed: 0,
                accuracy: 0,
                score: 0,
                correctCells: [],
                selectedCells: []
            },
            gridNumbers: [],
            isLastTraining: false // 新增变量，标记是否是最后一个训练
        };
    },
    computed: {
        evaluation() {
            const { score } = this.result;

            if (score === 3) {
                return '记忆力优秀';
            } else if (score === 2) {
                return '记忆力良好';
            } else if (score === 1) {
                return '记忆力一般';
            } else {
                return '需要加强训练';
            }
        },
        evaluationColor() {
            const { score } = this.result;

            if (score === 3) {
                return '#52c41a';
            } else if (score === 2) {
                return '#1890ff';
            } else if (score === 1) {
                return '#faad14';
            } else {
                return '#f5222d';
            }
        }
    },
    onLoad() {
        // 获取训练结果
        const result = uni.getStorageSync('trainingResult');
        if (result) {
            this.result = result;

            // 如果结果中包含网格数字，使用它们
            if (result.gridNumbers && result.gridNumbers.length > 0) {
                this.gridNumbers = result.gridNumbers;
            } else {
                // 否则尝试从存储中获取
                const storedGridNumbers = uni.getStorageSync('gridNumbers');
                if (storedGridNumbers && storedGridNumbers.length > 0) {
                    this.gridNumbers = storedGridNumbers;
                } else {
                    // 如果都没有，生成1-9的随机数字
                    this.gridNumbers = Array(25).fill().map(() => Math.floor(Math.random() * 9) + 1);
                }
            }
            
            // 检查是否是最后一个训练
            const progress = getTrainingProgress();
            this.isLastTraining = (progress.completedCount === 24 || progress.isCompleted === true || 
                (progress.currentRoundGroup === 4 && progress.completedInRound >= 6));
            
            console.log("当前训练进度:", progress.completedCount, ", 是否是最后一个:", this.isLastTraining);
        } else {
            // 没有结果，返回首页
            uni.showToast({
                title: '没有训练结果',
                icon: 'none'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    },
    methods: {
        continueTraining() {
            // 获取最新进度
            const progress = getTrainingProgress();
            console.log("当前训练进度:", progress);
            
            // 明确检查训练是否完成
            if (progress.isCompleted === true || 
                (progress.currentRoundGroup === 3 && progress.completedInRound >= 6)) {
                console.log("训练已完成，跳转到最终结果页面");
                // 全部训练已完成，跳转到最终结果页
                uni.reLaunch({
                    url: '/pages/finalResult/finalResult'
                });
            } else {
                console.log("训练未完成，返回选择页面继续");
                // 继续训练，返回选择页面
                uni.reLaunch({
                    url: '/pages/selection/selection'
                });
            }
        },
        backToHome() {
            // 清除结果
            uni.removeStorageSync('trainingResult');

            // 返回首页
            uni.reLaunch({
                url: '/pages/index/index'
            });
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
    margin-bottom: 30rpx;
}

.result-card {
    width: 90%;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    padding: 30rpx;
    margin-bottom: 40rpx;
}

.result-item {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 0;
    border-bottom: 1px solid #f0f0f0;
}

.result-item:last-child {
    border-bottom: none;
}

.label {
    font-size: 28rpx;
    color: #666;
}

.value {
    font-size: 28rpx;
    font-weight: bold;
    color: #333;
}

.grid-comparison {
    display: flex;
    justify-content: space-between;
    width: 90%;
    margin-bottom: 40rpx;
}

.grid-container {
    width: 48%;
}

.grid-title {
    font-size: 28rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20rpx;
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
    font-size: 24rpx;
    background-color: #f8f8f8;
    border-radius: 4rpx;
}

.correct {
    background-color: #52c41a;
    color: white;
}

.selected {
    background-color: #1890ff;
    color: white;
}

.wrong {
    background-color: #f5222d;
    color: white;
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