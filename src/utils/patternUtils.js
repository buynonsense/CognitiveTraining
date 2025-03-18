/**
 * 生成训练图案
 * @returns {Array} 6组不同的图案
 */
export function generatePatterns() {
    // 生成6组图案
    const patternTypes = ['L', 'T', 'Z', 'S', 'O', '+'];
    const patterns = [];

    for (let i = 0; i < 6; i++) {
        // 为每个3x3网格生成随机数字
        const numbers = Array(9).fill().map(() => Math.floor(Math.random() * 9) + 1);

        // 根据图案类型选择单元格
        let cells = [];

        switch (patternTypes[i]) {
            case 'L':
                cells = [0, 3, 6, 7, 8];
                break;
            case 'T':
                cells = [0, 1, 2, 4, 7];
                break;
            case 'Z':
                cells = [0, 1, 4, 7, 8];
                break;
            case 'S':
                cells = [1, 2, 4, 6, 7];
                break;
            case 'O':
                cells = [0, 1, 3, 4];
                break;
            case '+':
                cells = [1, 3, 4, 5, 7];
                break;
        }

        patterns.push({
            index: i,
            type: patternTypes[i],
            numbers: numbers,
            cells: cells
        });
    }

    return patterns;
}

/**
 * 生成训练序列
 * @param {Array} patterns 6组不同的图案
 * @returns {Array} 训练序列，包含18个图案
 */
export function generateTrainingSequence(patterns) {
    // 创建6个图案，每个图案3份的序列
    const sequence = [];

    // 第一轮：6个原始图案（计分）
    patterns.forEach(pattern => {
        sequence.push({
            ...pattern,
            isFirstAppearance: true,
            round: 1
        });
    });

    // 第二轮：6个图案的第一份副本（不计分）
    patterns.forEach(pattern => {
        sequence.push({
            ...pattern,
            isFirstAppearance: false,
            round: 2
        });
    });

    // 第三轮：6个图案的第二份副本（不计分）
    patterns.forEach(pattern => {
        sequence.push({
            ...pattern,
            isFirstAppearance: false,
            round: 3
        });
    });

    // 随机打乱顺序，但保持轮次顺序
    const firstRound = sequence.slice(0, 6);
    const secondRound = sequence.slice(6, 12);
    const thirdRound = sequence.slice(12, 18);

    // 随机打乱每轮的顺序
    shuffleArray(firstRound);
    shuffleArray(secondRound);
    shuffleArray(thirdRound);

    return [...firstRound, ...secondRound, ...thirdRound];
}

/**
 * 辅助函数：随机打乱数组
 * @param {Array} array 要打乱的数组
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 计算分数
 * @param {number} timeUsed 用时（秒）
 * @param {boolean} isCorrect 是否正确完成
 * @returns {number} 得分
 */
export function calculateScore(timeUsed, isCorrect = true) {
    if (!isCorrect) return 0;

    if (timeUsed <= 10) {
        return 3;
    } else if (timeUsed <= 15) {
        return 2;
    } else if (timeUsed <= 30) {
        return 1;
    }
    return 0; // 超过30秒
}

/**
 * 评估记忆能力（基于总分）
 * @param {number} totalScore 总分数（满分18分）
 * @returns {object} 记忆能力评估结果
 */
export function evaluateMemory(totalScore) {
    let result = {
        level: '',
        description: '',
        color: ''
    };

    if (totalScore >= 14 && totalScore <= 18) {
        result.level = '记忆力正常';
        result.description = '您的记忆力处于正常水平';
        result.color = '#52c41a'; // 绿色
    } else if (totalScore >= 9 && totalScore <= 13) {
        result.level = '记忆力较弱';
        result.description = '您的记忆力略有下降，建议进行更多训练';
        result.color = '#1890ff'; // 蓝色
    } else if (totalScore >= 5 && totalScore <= 8) {
        result.level = '记忆力弱';
        result.description = '您的记忆力明显下降，需要定期训练';
        result.color = '#faad14'; // 橙色
    } else {
        result.level = '记忆力缺陷';
        result.description = '您的记忆力存在明显缺陷，建议咨询专业医师';
        result.color = '#f5222d'; // 红色
    }

    return result;
}

/**
 * 评估记忆提升能力
 * @param {Array} firstTimeList 第一次找出各图案的时间列表
 * @param {Array} secondTimeList 第二次找出各图案的时间列表
 * @returns {object} 记忆提升评估结果
 */
export function evaluateImprovement(firstTimeList, secondTimeList) {
    if (firstTimeList.length !== secondTimeList.length || firstTimeList.length === 0) {
        return {
            level: '数据不完整',
            description: '无法评估记忆提升情况',
            color: '#666666',
            avgRatio: 0
        };
    }

    let ratios = [];
    for (let i = 0; i < firstTimeList.length; i++) {
        // 防止除以零
        if (firstTimeList[i] === 0) continue;

        const diff = firstTimeList[i] - secondTimeList[i];
        const ratio = (diff / firstTimeList[i]) * 100;
        ratios.push(ratio);
    }

    if (ratios.length === 0) {
        return {
            level: '数据异常',
            description: '无法评估记忆提升情况',
            color: '#666666',
            avgRatio: 0
        };
    }

    const avgRatio = ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length;
    let result = {
        level: '',
        description: '',
        color: '',
        avgRatio: Math.round(avgRatio)
    };

    if (avgRatio >= 20 && avgRatio <= 30) {
        result.level = '记忆力正常';
        result.description = '您的记忆力提升幅度在正常范围内，表现良好';
        result.color = '#52c41a'; // 绿色
    } else if (avgRatio >= 10 && avgRatio < 20) {
        result.level = '记忆力较弱';
        result.description = '您的记忆力提升幅度较小，建议进行更多训练';
        result.color = '#1890ff'; // 蓝色
    } else if (avgRatio >= 0 && avgRatio < 10) {
        result.level = '记忆力弱';
        result.description = '您的记忆力提升幅度很小，需要定期训练';
        result.color = '#faad14'; // 橙色
    } else {
        result.level = '记忆力缺陷';
        result.description = '您的记忆力没有提升或有所下降，建议咨询专业医师';
        result.color = '#f5222d'; // 红色
    }

    return result;
}

/**
 * 获取当前训练进度
 * @returns {object} 包含当前轮次和总进度的对象
 */
export function getTrainingProgress() {
    const progress = uni.getStorageSync('trainingProgress') || {
        currentRound: 1,
        currentRoundGroup: 1,
        completedCount: 0,
        completedInRound: 0,
        totalCompleted: 0,
        totalScore: 0,
        firstRoundScores: {},
        firstAppearanceTimes: {}
    };

    return progress;
}

/**
 * 更新训练进度
 * @param {number|string|object} patternIdentifier 图案标识符（可以是索引、类型或整个对象）
 * @param {number} score 得分
 * @param {number} timeUsed 用时
 * @param {boolean} isFirstAppearance 是否首次出现
 * @returns {object} 更新后的进度
 */
export function updateTrainingProgress(patternIdentifier, score, timeUsed, isFirstAppearance) {
    const progress = getTrainingProgress();
    
    // 获取图案类型
    let patternType, roundGroup;
    if (typeof patternIdentifier === 'object' && patternIdentifier !== null) {
        patternType = patternIdentifier.type;
        roundGroup = patternIdentifier.roundGroup;
        isFirstAppearance = patternIdentifier.isFirstAppearance;
    } else if (typeof patternIdentifier === 'string') {
        patternType = patternIdentifier;
        // 尝试确定轮次
        roundGroup = progress.currentRoundGroup || 1;
    } else {
        // 如果是数字索引
        const patterns = uni.getStorageSync('initialPatterns') || [];
        patternType = patterns[patternIdentifier]?.type || `pattern_${patternIdentifier}`;
        roundGroup = progress.currentRoundGroup || 1;
    }
    
    // 记录总完成数
    progress.totalCompleted = (progress.totalCompleted || 0) + 1;
    progress.completedCount = progress.totalCompleted;
    
    // 记录当前大轮次完成数
    progress.completedInRound = (progress.completedInRound || 0) + 1;
    
    // 只有第一大轮次的图案才计分
    if (roundGroup === 1 || progress.currentRoundGroup === 1) {
        progress.totalScore += score;
        
        // 记录首次出现的图案时间和分数
        if (isFirstAppearance) {
            if (!progress.firstRoundScores) progress.firstRoundScores = {};
            if (!progress.firstAppearanceTimes) progress.firstAppearanceTimes = {};
            
            progress.firstRoundScores[patternType] = score;
            progress.firstAppearanceTimes[patternType] = timeUsed;
        }
    }
    // 如果是第三大轮次，记录用时用于后续比较
    else if (roundGroup === 3 || progress.currentRoundGroup === 3) {
        const thirdRoundTimes = uni.getStorageSync('thirdRoundTimes') || {};
        thirdRoundTimes[patternType] = timeUsed;
        uni.setStorageSync('thirdRoundTimes', thirdRoundTimes);
    }
    
    // 检查轮次变化 - 关键修改部分
    console.log(`当前状态：当前轮次 ${progress.currentRoundGroup}，已完成总数 ${progress.completedCount}`);
    
    // 完成第6个训练项，进入第2大轮次
    if (progress.completedCount === 6 && progress.currentRoundGroup === 1) {
        progress.currentRoundGroup = 2;
        progress.completedInRound = 0;
        console.log("已完成6个训练，进入第二轮次");
    } 
    // 完成第12个训练项，进入第3大轮次（关键修复）
    else if (progress.completedCount === 12 && progress.currentRoundGroup === 2) {
        progress.currentRoundGroup = 3;
        progress.completedInRound = 0;
        console.log("已完成12个训练，进入第三轮次");
        
        // 生成第三大轮次的全新图案
        const thirdRoundPatterns = generatePatterns().map(pattern => ({
            ...pattern,
            isFirstAppearance: false,
            roundGroup: 3 // 标记为第3大轮次
        }));
        
        // 保存第三轮次图案
        uni.setStorageSync('thirdRoundPatterns', thirdRoundPatterns);
    }
    // 完成第18个训练项，应该进入第4大轮次而不是结束训练
    else if (progress.completedCount === 18 && progress.currentRoundGroup === 3) {
        progress.currentRoundGroup = 4; // 进入第4轮，不是结束
        progress.completedInRound = 0;
        console.log("已完成18个训练，进入第四轮次（比较测试）");
        
        // 生成第四轮的6个全新图案
        const fourthRoundPatterns = generatePatterns().map(pattern => ({
            ...pattern,
            isFirstAppearance: false,
            roundGroup: 4 // 标记为第4大轮次
        }));
        
        // 保存第四轮图案
        uni.setStorageSync('fourthRoundPatterns', fourthRoundPatterns);
    }
    // 完成第24个训练项，才真正标记训练完成
    else if (progress.completedCount === 24) {
        progress.isCompleted = true;
        console.log("已完成全部24次训练，训练结束！");
    }
    
    // 检查是否完成了所有训练
    if (progress.currentRoundGroup === 4 && progress.completedInRound >= 6) {
        console.log("所有训练已完成！设置isCompleted为true");
        progress.isCompleted = true;
        
        // 计算第一轮和第四轮的时间比值
        calculateTimeRatios();
    }
    
    uni.setStorageSync('trainingProgress', progress);
    
    // 更新选择池函数也需要修改
    return updateSelectionPoolFixed(patternType, progress);
}

/**
 * 更新后的选择池函数，修复进入第三轮的问题
 */
function updateSelectionPoolFixed(patternType, progress) {
    let pool = uni.getStorageSync('selectionPool') || [];
    
    // 如果训练已完成，直接返回空数组
    if (progress.isCompleted) {
        console.log("训练已完成，返回空选择池");
        uni.setStorageSync('selectionPool', []);
        return [];
    }
    
    // 从选择池中移除当前图案
    pool = pool.filter(p => p.type !== patternType);
    
    // 根据当前轮次更新选择池
    if (progress.currentRoundGroup === 1) {
        // 第一轮正常进行
        if (pool.length === 0 && progress.completedInRound < 6) {
            // 异常情况：选择池空了但还没完成第一轮
            const initialPatterns = uni.getStorageSync('initialPatterns') || [];
            const remainingPatterns = initialPatterns.filter(p => 
                !progress.firstAppearanceTimes || !progress.firstAppearanceTimes[p.type]);
            pool = [...remainingPatterns];
        }
    } 
    else if (progress.currentRoundGroup === 2) {
        // 第二轮
        if (pool.length === 0 || (progress.completedInRound % 6 === 0 && progress.completedInRound > 0)) {
            // 需要补充第二轮的图案
            const secondRoundPatterns = uni.getStorageSync('secondRoundPatterns') || [];
            // 计算已使用的模式数量
            const usedCount = progress.completedInRound;
            // 获取未使用的模式
            const remainingPatterns = secondRoundPatterns.slice(usedCount, usedCount + 6);
            pool = [...remainingPatterns];
            console.log(`补充第二轮图案，当前已完成 ${progress.completedInRound}，添加 ${remainingPatterns.length} 个图案`);
        }
    }
    else if (progress.currentRoundGroup === 3) {
        // 第三轮
        if (pool.length === 0) {
            // 需要使用第三轮的图案
            const thirdRoundPatterns = uni.getStorageSync('thirdRoundPatterns') || [];
            if (thirdRoundPatterns.length > 0) {
                pool = [...thirdRoundPatterns];
                console.log(`使用第三轮图案，共 ${thirdRoundPatterns.length} 个`);
            } else {
                // 如果没有第三轮图案，生成新的
                const newPatterns = generatePatterns().map(pattern => ({
                    ...pattern,
                    isFirstAppearance: false,
                    roundGroup: 3
                }));
                pool = [...newPatterns];
                uni.setStorageSync('thirdRoundPatterns', newPatterns);
                console.log(`生成新的第三轮图案，共 ${newPatterns.length} 个`);
            }
        }
    }
    // 在updateSelectionPoolFixed函数中添加第四轮的处理

    // 如果是第四轮
    else if (progress.currentRoundGroup === 4) {
        // 第四轮
        if (pool.length === 0) {
            // 使用第四轮的全新图案
            const fourthRoundPatterns = uni.getStorageSync('fourthRoundPatterns') || [];
            if (fourthRoundPatterns.length > 0) {
                pool = [...fourthRoundPatterns];
                console.log(`使用第四轮全新图案，共 ${fourthRoundPatterns.length} 个`);
            } else {
                // 如果没有第四轮图案，生成新的
                const newPatterns = generatePatterns().map(pattern => ({
                    ...pattern,
                    isFirstAppearance: false,
                    roundGroup: 4
                }));
                pool = [...newPatterns];
                uni.setStorageSync('fourthRoundPatterns', newPatterns);
                console.log(`生成新的第四轮图案，共 ${newPatterns.length} 个`);
            }
        }
    }
    
    uni.setStorageSync('selectionPool', pool);
    return pool;
}

/**
 * 保存训练记录
 * @param {object} record 训练记录对象
 */
export function saveTrainingRecord(record) {
    const records = uni.getStorageSync('trainingRecords') || [];

    // 获取当前训练进度
    const progress = getTrainingProgress();

    // 添加轮次信息到记录中
    record.completedCount = progress.completedCount;
    record.round = progress.currentRoundGroup;
    record.timestamp = Date.now();

    records.push(record);
    uni.setStorageSync('trainingRecords', records);
}

/**
 * 重置训练
 */
export function resetTraining() {
    // 清除所有训练相关的存储
    uni.removeStorageSync('trainingProgress');
    uni.removeStorageSync('trainingRecords');
    uni.removeStorageSync('initialPatterns');
    uni.removeStorageSync('selectionPool');
    uni.removeStorageSync('secondRoundPatterns');
    uni.removeStorageSync('thirdRoundPatterns');
    uni.removeStorageSync('thirdRoundTimes');
    uni.removeStorageSync('trainingResult');
    uni.removeStorageSync('trainingSequence');
}

/**
 * 初始化训练
 */
export function initializeTraining() {
    // 先重置训练状态
    resetTraining();

    // 生成第一大轮次的6个基本图案
    const firstRoundPatterns = generatePatterns();

    // 生成第二大轮次的12个图案副本（每个图案2个副本）
    const secondRoundPatterns = [];
    firstRoundPatterns.forEach(pattern => {
        // 为每个图案创建2个副本
        for (let i = 0; i < 2; i++) {
            secondRoundPatterns.push({
                ...pattern,
                isFirstAppearance: false,
                roundGroup: 2 // 标记为第2大轮次
            });
        }
    });

    // 随机打乱第二轮次顺序
    for (let i = secondRoundPatterns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [secondRoundPatterns[i], secondRoundPatterns[j]] = [secondRoundPatterns[j], secondRoundPatterns[i]];
    }

    // 为第一轮次添加标记
    const markedFirstRoundPatterns = firstRoundPatterns.map(pattern => ({
        ...pattern,
        isFirstAppearance: true,
        roundGroup: 1 // 标记为第1大轮次
    }));

    // 保存初始图案和选择池
    uni.setStorageSync('initialPatterns', markedFirstRoundPatterns);
    uni.setStorageSync('selectionPool', [...markedFirstRoundPatterns]); // 初始选择池是第一轮次的图案
    uni.setStorageSync('secondRoundPatterns', secondRoundPatterns);

    // 设置训练进度
    const progress = {
        currentRound: 1,
        currentRoundGroup: 1, // 当前大轮次
        completedCount: 0,
        completedInRound: 0,  // 当前大轮次已完成数量
        totalCompleted: 0,    // 总共已完成数量
        totalScore: 0,        // 总分
        firstAppearanceTimes: {} // 第一轮次的用时记录
    };
    uni.setStorageSync('trainingProgress', progress);

    return {
        firstRoundPatterns,
        secondRoundPatterns
    };
}

/**
 * 获取当前选择池中的图案
 * @returns {Array} 当前可选择的图案数组
 */
export function getSelectionPool() {
    const pool = uni.getStorageSync('selectionPool') || [];
    return pool;
}

/**
 * 从选择池中移除已训练的图案，根据当前进度添加新图案
 * @param {Object} pattern 已完成训练的图案
 */
export function updateSelectionPool(pattern) {
    let pool = uni.getStorageSync('selectionPool') || [];
    const progress = getTrainingProgress();
    
    // 如果训练已完成，直接返回空数组
    if (progress.isCompleted) {
        console.log("训练已完成，返回空选择池");
        uni.setStorageSync('selectionPool', []);
        return [];
    }
    
    // 从选择池中移除当前图案
    pool = pool.filter(p => p.type !== pattern.type);
    
    // 根据当前大轮次的进度，添加新图案
    if (progress.currentRoundGroup === 1 && progress.completedInRound >= 6) {
        // 第一大轮次完成，开始第二大轮次
        const secondRoundPatterns = uni.getStorageSync('secondRoundPatterns') || [];
        // 只添加12个图案中的前6个到选择池
        pool = secondRoundPatterns.slice(0, 6);
        
        // 更新进度为第二大轮次
        progress.currentRoundGroup = 2;
        progress.completedInRound = 0;
        uni.setStorageSync('trainingProgress', progress);
        console.log("进入第二大轮次");
    } else if (progress.currentRoundGroup === 2) {
        // 检查是否完成了第二大轮次
        if (progress.completedInRound >= 12 || progress.completedCount >= 18) { // 修改判断条件
            console.log("第二大轮次完成，准备进入第三大轮次");
            // 第二大轮次完成，生成第三大轮次的全新图案
            const thirdRoundPatterns = generatePatterns().map(pattern => ({
                ...pattern,
                isFirstAppearance: false,
                roundGroup: 3 // 标记为第3大轮次
            }));

            // 更新进度为第三大轮次
            progress.currentRoundGroup = 3;
            progress.completedInRound = 0;
            uni.setStorageSync('trainingProgress', progress);

            // 设置第三轮的选择池
            pool = thirdRoundPatterns;
            console.log("进入第三大轮次，使用全新图案");
        } else {
            // 第二大轮次，从剩余的图案中添加一个到选择池
            const secondRoundPatterns = uni.getStorageSync('secondRoundPatterns') || [];
            const usedCount = 6 + progress.completedInRound;
            
            // 确保不超出数组范围
            if (usedCount < secondRoundPatterns.length) {
                pool.push(secondRoundPatterns[usedCount]);
                console.log(`添加第二轮第${usedCount+1}个图案到选择池`);
            }
        }
    } else if (progress.currentRoundGroup === 3 && progress.completedInRound >= 6) {
        // 第三轮已完成，标记训练完成
        console.log("第三轮已完成，标记训练为已完成状态");
        progress.isCompleted = true;
        uni.setStorageSync('trainingProgress', progress);
        
        // 清空选择池，防止继续训练
        pool = [];
    }
    
    uni.setStorageSync('selectionPool', pool);
    return pool;
}

/**
 * 检查训练是否已完成
 * @returns {boolean} 训练是否已完成
 */
export function isTrainingCompleted() {
    const progress = getTrainingProgress();
    return progress.isCompleted === true;
}

/**
 * 计算第一轮和第四轮的时间比值
 */
function calculateTimeRatios() {
    const progress = getTrainingProgress();
    const firstRoundTimes = progress.firstAppearanceTimes || {};
    const fourthRoundTimes = uni.getStorageSync('fourthRoundTimes') || {};
    
    let ratios = [];
    let total = 0;
    let count = 0;
    
    // 计算每个图案的时间差值比值
    for (const type in firstRoundTimes) {
        if (fourthRoundTimes[type]) {
            const firstTime = firstRoundTimes[type];
            const fourthTime = fourthRoundTimes[type];
            
            if (firstTime > 0) {  // 避免除以零
                const diff = firstTime - fourthTime;
                const ratio = (diff / firstTime) * 100; // 转换为百分比
                ratios.push({type, firstTime, fourthTime, diff, ratio});
                total += ratio;
                count++;
            }
        }
    }
    
    // 计算平均比值
    const avgRatio = count > 0 ? total / count : 0;
    
    // 评估记忆提升水平
    let improvement = {
        level: '',
        description: '',
        color: '',
        avgRatio: Math.round(avgRatio),
        details: ratios
    };
    
    if (avgRatio >= 20 && avgRatio <= 30) {
        improvement.level = '记忆力正常';
        improvement.description = '您的记忆力提升幅度在正常范围内，表现良好';
        improvement.color = '#52c41a'; // 绿色
    } else if (avgRatio >= 10 && avgRatio < 20) {
        improvement.level = '记忆力较弱';
        improvement.description = '您的记忆力提升幅度较小，建议进行更多训练';
        improvement.color = '#1890ff'; // 蓝色
    } else if (avgRatio >= 0 && avgRatio < 10) {
        improvement.level = '记忆力弱';
        improvement.description = '您的记忆力提升幅度很小，需要定期训练';
        improvement.color = '#faad14'; // 橙色
    } else {
        improvement.level = '记忆力缺陷';
        improvement.description = '您的记忆力没有提升或有所下降，建议咨询专业医师';
        improvement.color = '#f5222d'; // 红色
    }
    
    // 保存结果
    uni.setStorageSync('memoryImprovement', improvement);
}