<template>
    <view class="container">
        <view class="title">选择图形</view>
        <view class="instruction-box">
            <view class="subtitle">请从下面6组图形中，任意选择一组图形！</view>
            <view class="highlight-text">选择后请要牢记图形的形状和内容哦！</view>
        </view>

        <!-- 如果训练已完成，显示最终结果按钮 -->
        <view class="training-completed" v-if="isTrainingComplete">
            <view class="complete-message">恭喜！您已完成全部24次训练</view>
            <wd-button type="primary" @click="goToFinalResult" class="final-result-btn">
                查看最终评估结果
            </wd-button>
        </view>

        <view class="grid" v-else>
            <view v-for="(pattern, index) in patterns" :key="index" class="pattern-card"
                @click="selectPattern(pattern)">
                <view class="pattern-grid">
                    <view v-for="(cell, cellIndex) in 9" :key="cellIndex" class="grid-cell"
                        :class="{ 'selected': pattern.cells.includes(cellIndex) }">
                        <!-- 只在选中的单元格中显示数字 -->
                        <template v-if="pattern.cells.includes(cellIndex)">
                            {{ pattern.numbers[cellIndex] }}
                        </template>
                    </view>
                </view>
                
                <!-- 添加已完成标记 -->
                <view v-if="isPatternCompleted(pattern)" class="completed-mark">
                    <text class="completed-icon">✓</text>
                    <text class="completed-text">已完成</text>
                </view>
            </view>
        </view>

        <!-- 进度显示 -->
        <view class="progress-info">
            {{ progressText }}
        </view>

        <!-- 底部抽屉 -->
        <wd-popup v-model="showPatternPopup" position="bottom" custom-style="border-radius: 16px 16px 0 0;">
            <view class="popup-container">
                <view class="popup-title">记住图形</view>
                <view class="popup-highlight">点击准备好了，我们将开始正式进入训练了...</view>

                <view class="selected-pattern" v-if="selectedPattern">
                    <view class="pattern-grid">
                        <view v-for="(cell, cellIndex) in 9" :key="cellIndex" class="grid-cell"
                            :class="{ 'selected': selectedPattern.cells.includes(cellIndex) }">
                            <!-- 只在选中的单元格中显示数字 -->
                            <template v-if="selectedPattern.cells.includes(cellIndex)">
                                {{ selectedPattern.numbers[cellIndex] }}
                            </template>
                        </view>
                    </view>
                </view>

                <view class="popup-buttons">
                    <wd-button type="default" @click="resetSelection">重新选择</wd-button>
                    <wd-button type="primary" @click="startTraining">准备好了</wd-button>
                </view>
            </view>
        </wd-popup>
    </view>
</template>

<script>
import {
    getTrainingProgress, initializeTraining, getSelectionPool, isTrainingCompleted,
    updateSelectionPool, updateSelectionPoolForNewRound, generatePatterns, isPatternCompleted
} from '@/utils/patternUtils';

export default {
    data() {
        return {
            patterns: [],
            selectedPattern: null,
            showPatternPopup: false,
            progressText: '',
            isTrainingComplete: false
        };
    },
    onLoad() {
        // 检查训练是否已完成
        this.checkTrainingStatus();

        // 获取当前选择池
        this.loadSelectionPool();

        // 显示当前训练进度
        this.updateProgressDisplay();
    },
    onShow() {
        // 重新检查训练状态
        this.checkTrainingStatus();

        // 每次显示页面时都重新加载选择池，确保数据最新
        this.loadSelectionPool();
    },
    methods: {
        // 检查训练状态
        checkTrainingStatus() {
            const progress = getTrainingProgress();
            this.isTrainingComplete = isTrainingCompleted() ||
                (progress.currentRoundGroup === 4 && progress.completedInRound >= 6);

            console.log("训练完成状态:", this.isTrainingComplete);
            console.log("当前轮次:", progress.currentRoundGroup);
            console.log("当前轮次已完成:", progress.completedInRound);

            // 如果训练已完成但没有标记为完成，则标记为完成
            if (this.isTrainingComplete && !progress.isCompleted) {
                progress.isCompleted = true;
                uni.setStorageSync('trainingProgress', progress);

                // 清空选择池以防止继续训练
                uni.setStorageSync('selectionPool', []);
            }
        },

        // 跳转到最终结果页面
        goToFinalResult() {
            uni.reLaunch({
                url: '/pages/finalResult/finalResult'
            });
        },

        // 添加检查图案是否已完成的方法
        isPatternCompleted(pattern) {
            return isPatternCompleted(pattern);
        },

        selectPattern(pattern) {
            // 如果图案已完成，显示提示
            if (this.isPatternCompleted(pattern)) {
                uni.showToast({
                    title: '该图形已完成训练',
                    icon: 'none'
                });
                return;
            }
            
            this.selectedPattern = pattern;
            this.showPatternPopup = true;

            // 把选择的图案存入缓存
            uni.setStorageSync('selectedPattern', pattern);
        },
        resetSelection() {
            this.showPatternPopup = false;
            this.selectedPattern = null;
        },
        startTraining() {
            // 跳转到训练页面
            uni.redirectTo({
                url: '/pages/training/training'
            });
        },
        loadSelectionPool() {
            const progress = getTrainingProgress();
            
            // 输出当前进度信息，便于调试
            console.log(`当前进度 - 轮次: ${progress.currentRoundGroup}, 总完成: ${progress.completedCount}, 当前轮次已完成: ${progress.completedInRound}`);
            
            // 检查是否训练已完成
            if (progress.isCompleted) {
                this.isTrainingComplete = true;
                this.patterns = [];
                return;
            }
            
            // 针对第一轮的特殊处理
            if (progress.currentRoundGroup === 1) {
                console.log("加载第一轮图案");
                let initialPatterns = uni.getStorageSync('initialPatterns');
                
                // 如果初始图案不存在或为空，则重新初始化训练
                if (!initialPatterns || initialPatterns.length === 0) {
                    console.log("初始图案不存在，重新初始化训练");
                    const result = initializeTraining();
                    initialPatterns = result.firstRoundPatterns.map(p => ({
                        ...p,
                        isFirstAppearance: true,
                        roundGroup: 1
                    }));
                    uni.setStorageSync('initialPatterns', initialPatterns);
                }
                
                // 强制使用初始图案，不管选择池现状如何
                uni.setStorageSync('selectionPool', [...initialPatterns]); // 设置为完整的浅拷贝
                this.patterns = initialPatterns;
                this.updateProgressDisplay();
                return;
            }
            
            // 针对第二轮的特殊处理
            if (progress.currentRoundGroup === 2) {
                console.log("加载第二轮图案");
                const secondRoundPatterns = uni.getStorageSync('secondRoundPatterns') || [];
                
                if (secondRoundPatterns.length > 0) {
                    // 强制使用第二轮图案
                    uni.setStorageSync('selectionPool', [...secondRoundPatterns]);
                    this.patterns = secondRoundPatterns;
                    this.updateProgressDisplay();
                    return;
                }
            }
            
            // 针对第三轮的特殊处理
            if (progress.currentRoundGroup === 3) {
                console.log("加载第三轮图案");
                const thirdRoundPatterns = uni.getStorageSync('thirdRoundPatterns') || [];
                
                if (thirdRoundPatterns.length > 0) {
                    // 强制使用第三轮图案
                    uni.setStorageSync('selectionPool', [...thirdRoundPatterns]);
                    this.patterns = thirdRoundPatterns;
                    this.updateProgressDisplay();
                    return;
                }
            }
            
            // 优先级提高：强制检查是否需要生成第四轮图案
            if (progress.currentRoundGroup === 4 && 
                (uni.getStorageSync('readyForRound4') || uni.getStorageSync('forceGenerateRound4'))) {
                console.log("强制生成第四轮图案");
                
                try {
                    // 清除所有标志
                    uni.removeStorageSync('readyForRound4');
                    uni.removeStorageSync('forceGenerateRound4');
                    
                    // 彻底清空当前选择池
                    uni.removeStorageSync('selectionPool');
                    
                    // 生成第四轮的6个全新图案
                    const fourthRoundPatterns = generatePatterns(4).map(pattern => ({
                        ...pattern,
                        isFirstAppearance: false,
                        roundGroup: 4 // 标记为第4大轮次
                    }));
                    
                    // 保存第四轮图案并设置为当前选择池
                    uni.setStorageSync('fourthRoundPatterns', fourthRoundPatterns);
                    uni.setStorageSync('selectionPool', fourthRoundPatterns);
                    
                    this.patterns = fourthRoundPatterns;
                    this.updateProgressDisplay();
                    
                    console.log(`成功生成第四轮图案，数量: ${fourthRoundPatterns.length}`);
                    return;
                } catch (error) {
                    console.error("生成第四轮图案错误:", error);
                }
            }
            
            // 针对第四轮的特殊处理，确保一定能显示第四轮图案
            if (progress.currentRoundGroup === 4) {
                console.log("加载第四轮图案");
                let fourthRoundPatterns = uni.getStorageSync('fourthRoundPatterns');
                
                // 如果第四轮图案不存在或为空，则重新生成
                if (!fourthRoundPatterns || fourthRoundPatterns.length === 0) {
                    console.log("第四轮图案不存在，重新生成");
                    fourthRoundPatterns = generatePatterns(4).map(p => ({
                        ...p,
                        isFirstAppearance: false,
                        roundGroup: 4
                    }));
                    uni.setStorageSync('fourthRoundPatterns', fourthRoundPatterns);
                }
                
                // 强制使用第四轮图案
                uni.setStorageSync('selectionPool', [...fourthRoundPatterns]);
                this.patterns = fourthRoundPatterns;
                console.log("第四轮图案数量:", this.patterns.length);
                
                // 输出日志便于调试
                this.patterns.forEach((p, i) => {
                    console.log(`第四轮图案 #${i+1}, 类型: ${p.type}, 轮次: ${p.roundGroup}`);
                });
                
                this.updateProgressDisplay();
                return;
            }
            
            // 获取并验证当前选择池
            let pool = getSelectionPool();
            
            // 如果选择池为空或不匹配当前轮次，重新获取
            if (!pool || pool.length === 0 || pool.some(p => p.roundGroup !== progress.currentRoundGroup)) {
                console.log(`选择池为空或不匹配当前轮次 ${progress.currentRoundGroup}，尝试重建`);
                updateSelectionPoolForNewRound(progress.currentRoundGroup);
                pool = getSelectionPool();
            }
            
            this.patterns = pool || [];
            console.log(`当前选择池图案数量: ${this.patterns.length}`);
            this.updateProgressDisplay();
        },

        updateProgressDisplay() {
            const progress = getTrainingProgress();
            let roundText = "第一轮";
            if (progress.currentRoundGroup === 2) roundText = "第二轮";
            if (progress.currentRoundGroup === 3) roundText = "第三轮";
            if (progress.currentRoundGroup === 4) roundText = "第四轮(最终比较)";

            this.progressText = `${roundText} - 已完成 ${progress.totalCompleted}/24`;
        }
    }
};
</script>

<style>
.container {
    padding: 20rpx;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
}

.title {
    font-size: 40rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 10rpx;
    color: #333;
}

.instruction-box {
    background-color: #f0fff4;
    border-radius: 10rpx;
    padding: 20rpx;
    margin-bottom: 20rpx;
    border-left: 8rpx solid #409EFF;
}

.subtitle {
    font-size: 30rpx;
    color: #333;
    text-align: center;
    line-height: 1.4;
    margin-bottom: 10rpx;
    font-weight: 500;
}

.highlight-text {
    font-size: 32rpx;
    color: #409EFF;
    text-align: center;
    font-weight: bold;
    line-height: 1.5;
}

.grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    padding-bottom: 20rpx;
}

.pattern-card {
    position: relative; /* 为已完成标记提供定位上下文 */
    width: 48%;
    margin-bottom: 20rpx;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    padding: 15rpx;
    box-sizing: border-box;
}

.pattern-title {
    font-size: 26rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
    text-align: center;
}

.pattern-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 3rpx;
}

.grid-cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    background-color: #f8f8f8;
    border-radius: 4rpx;
}

.selected {
    background-color: #22c55e;
    color: white;
}

.popup-container {
    padding: 40rpx 30rpx;
}

.popup-title {
    font-size: 40rpx;
    font-weight: bold;
    text-align: center;
    margin-bottom: 20rpx;
    color: #333;
}

.popup-highlight {
    font-size: 32rpx;
    color: #f56c6c;
    text-align: center;
    margin-bottom: 40rpx;
    font-weight: bold;
}

.selected-pattern {
    width: 70%;
    margin: 0 auto 60rpx;
}

.selected-pattern .pattern-grid {
    /* 弹出框中的网格可以稍大一些 */
    gap: 4rpx;
}

.selected-pattern .grid-cell {
    font-size: 32rpx;
}

.popup-buttons {
    display: flex;
    justify-content: space-between;
    gap: 20rpx;
}

/* 添加训练完成相关样式 */
.training-completed {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 40rpx 0;
    padding: 40rpx;
    width: 90%;
    background-color: #f0f9eb;
    border-radius: 12rpx;
    border: 1px solid #e1f3d8;
}

.complete-message {
    font-size: 32rpx;
    color: #67c23a;
    font-weight: bold;
    margin-bottom: 30rpx;
    text-align: center;
}

.final-result-btn {
    width: 80%;
    height: 80rpx;
    font-size: 32rpx;
}

.progress-info {
    font-size: 28rpx;
    color: #666;
    margin-top: 20rpx;
    text-align: center;
}

/* 添加已完成标记样式 */
.completed-mark {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: 12rpx;
    z-index: 2;
}

.completed-icon {
    font-size: 60rpx;
    color: white;
    margin-bottom: 10rpx;
}

.completed-text {
    color: white;
    background-color: #52c41a;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: bold;
}
</style>