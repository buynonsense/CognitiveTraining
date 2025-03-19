<template>
    <view class="container">
        <view class="header">
            <view class="timer">计时：{{ remainingTime }}</view>
        </view>

        <view class="instruction">
            请从下方5*5的方格中找出对应数组，并划动消除。每组数字只在网格中出现一次，并且不重复。训练限时30s！
        </view>

        <view class="pattern-to-find">
            <view class="pattern-label">找出下方数字进行划消：</view>
            <view class="pattern-display" v-if="selectedPattern">
                <!-- 只显示选中的单元格中的数字 -->
                <view v-for="cellIndex in selectedPattern.cells" :key="cellIndex" class="target-cell target-selected">
                    {{ selectedPattern.numbers[cellIndex] }}
                </view>
            </view>
        </view>

        <view class="grid-container">
            <view class="pattern-grid">
                <view v-for="(cell, index) in 25" :key="index" class="grid-cell"
                    :class="{ 'selected': selectedCells.includes(index) }" @click="toggleCell(index)">
                    {{ gridNumbers[index] }}
                </view>
            </view>
        </view>

        <view class="btn-container">
            <wd-button type="primary" @click="submitTraining" class="submit-btn">完成</wd-button>
        </view>
    </view>
</template>

<script>
import { calculateScore, saveTrainingRecord, updateTrainingProgress, getTrainingProgress, updateSelectionPool } from '@/utils/patternUtils';

export default {
    data() {
        return {
            selectedPattern: null,
            selectedCells: [],
            gridNumbers: [],
            startTime: 0,
            remainingTime: 30, // 改为30秒
            timer: null,
            targetPositions: []
        };
    },
    onLoad() {
        // 获取选择的图案
        this.selectedPattern = uni.getStorageSync('selectedPattern');

        if (!this.selectedPattern) {
            uni.showToast({
                title: '请先选择图形',
                icon: 'none'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
            return;
        }

        // 生成5x5网格内的数字并嵌入答案
        this.generateGridWithAnswer();

        // 开始计时
        this.startTime = Date.now();
        this.startCountdown();
    },
    onUnload() {
        this.clearTimer();
    },
    methods: {
        generateGridWithAnswer() {
            // 先生成随机的5x5网格
            this.gridNumbers = Array(25).fill().map(() => Math.floor(Math.random() * 9) + 1);

            // 随机确定3x3图案在5x5网格中的起始位置
            const startRow = Math.floor(Math.random() * 3); // 0, 1, 2
            const startCol = Math.floor(Math.random() * 3); // 0, 1, 2

            // 将选择的3x3图案嵌入到5x5网格中
            this.targetPositions = [];

            this.selectedPattern.cells.forEach((cellIndex) => {
                const row = Math.floor(cellIndex / 3);
                const col = cellIndex % 3;

                const targetRow = startRow + row;
                const targetCol = startCol + col;
                const targetIndex = targetRow * 5 + targetCol;

                this.gridNumbers[targetIndex] = this.selectedPattern.numbers[cellIndex];
                this.targetPositions.push(targetIndex);
            });

            // 存储生成的网格数字，以便结果页面使用
            uni.setStorageSync('gridNumbers', this.gridNumbers);
        },
        toggleCell(index) {
            const cellIdx = this.selectedCells.indexOf(index);

            if (cellIdx === -1) {
                // 添加到选择列表
                this.selectedCells.push(index);
            } else {
                // 从选择列表中移除
                this.selectedCells.splice(cellIdx, 1);
            }
        },
        submitTraining() {
            this.clearTimer();

            // 计算用时
            const endTime = Date.now();
            const timeUsed = 30 - this.remainingTime;

            // 计算正确率
            let correctCount = 0;
            this.selectedCells.forEach(cell => {
                if (this.targetPositions.includes(cell)) {
                    correctCount++;
                }
            });

            const totalTargets = this.targetPositions.length;
            const accuracy = Math.round((correctCount / totalTargets) * 100);
            const isCorrect = accuracy === 100;

            // 计算得分
            const score = calculateScore(timeUsed, isCorrect);
            
            // 获取当前训练进度
            const progress = getTrainingProgress();

            // 保存结果
            const result = {
                timeUsed,
                accuracy,
                score,
                correctCells: this.targetPositions,
                selectedCells: this.selectedCells,
                gridNumbers: this.gridNumbers, // 确保保存网格数字
                round: this.selectedPattern.roundGroup || progress.currentRoundGroup || 1, // 记录当前轮次
                isFirstAppearance: this.selectedPattern.isFirstAppearance || false // 是否首次出现
            };

            uni.setStorageSync('trainingResult', result);

            // 如果是第三轮，保存时间以便计算记忆提升
            if (this.selectedPattern.roundGroup === 3 || progress.currentRoundGroup === 3) {
                const thirdRoundTimes = uni.getStorageSync('thirdRoundTimes') || {};
                thirdRoundTimes[this.selectedPattern.type] = timeUsed;
                uni.setStorageSync('thirdRoundTimes', thirdRoundTimes);
            }

            // 如果是第四轮，保存时间以便计算与第一轮的比较
            if (this.selectedPattern.roundGroup === 4 || progress.currentRoundGroup === 4) {
                const fourthRoundTimes = uni.getStorageSync('fourthRoundTimes') || {};
                fourthRoundTimes[this.selectedPattern.type] = timeUsed;
                uni.setStorageSync('fourthRoundTimes', fourthRoundTimes);
                console.log(`记录第四轮图案 ${this.selectedPattern.type} 的完成时间: ${timeUsed}秒`);
            }

            // 更新训练进度
            updateTrainingProgress(
                this.selectedPattern,
                score,
                timeUsed,
                this.selectedPattern.isFirstAppearance || false
            );

            // 从选择池中移除已完成的图案
            updateSelectionPool(this.selectedPattern);

            // 保存训练记录
            saveTrainingRecord(result);

            // 跳转到结果页面
            uni.navigateTo({
                url: '/pages/result/result'
            });
        },
        startCountdown() {
            this.timer = setInterval(() => {
                if (this.remainingTime > 0) {
                    this.remainingTime--;
                } else {
                    // 时间到，自动提交
                    this.submitTraining();
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
    height: 100vh;
    box-sizing: border-box;
}

.header {
    width: 100%;
    margin-bottom: 20rpx;
}

.timer {
    font-size: 36rpx;
    font-weight: bold;
    color: #FF6B00;
    text-align: center;
}

.instruction {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 30rpx;
    padding: 0 20rpx;
    line-height: 1.5;
}

.pattern-to-find {
    width: 100%;
    margin-bottom: 30rpx;
}

.pattern-label {
    font-size: 28rpx;
    font-weight: bold;
    margin-bottom: 15rpx;
}

.pattern-display {
    display: flex;
    justify-content: center;
    gap: 10rpx;
}

.target-cell {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    background-color: #f8f8f8;
    border-radius: 6rpx;
}

.target-selected {
    background-color: #409EFF;
    color: white;
}

.grid-container {
    width: 90%;
    margin-bottom: 40rpx;
}

.pattern-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 6rpx;
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

.btn-container {
    width: 100%;
    margin-top: 40rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

.submit-btn {
    width: 60%;
    height: 90rpx;
    border-radius: 45rpx;
    font-size: 32rpx;
}
</style>