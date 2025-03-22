/**
 * 生成训练图案 - 针对不同轮次生成不同图案
 * @param {number} roundGroup 轮次组，默认为1
 * @returns {Array} 6组不同的图案
 */
export function generatePatterns(roundGroup = 1) {
    // 第四轮使用不同于前三轮的图案类型
    const patternTypes = roundGroup === 4 ? 
        ['L2', 'T2', 'Z2', 'S2', 'O2', 'X'] : // 第四轮使用带2后缀的类型
        ['L', 'T', 'Z', 'S', 'O', '+'];  // 前三轮使用原始类型
        
    const patterns = [];

    for (let i = 0; i < 6; i++) {
        // 为每个3x3网格生成随机数字
        const numbers = Array(9).fill().map(() => Math.floor(Math.random() * 9) + 1);

        // 根据图案类型选择单元格
        let cells = [];

        // 不同类型的图案使用不同的单元格布局
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
            
            // 第四轮的新图案类型
            case 'L2':
                cells = [0, 3, 6, 7, 8];
                break;
            case 'T2':
                cells = [1, 3, 4, 5, 7];
                break;
            case 'Z2':
                cells = [0, 1, 4, 7, 8];
                break;
            case 'S2':
                cells = [1, 2, 4, 6, 7];
                break;
            case 'O2':
                cells = [0, 1, 3, 4];
                break;
            case 'X':
                cells = [0, 2, 4, 6, 8]; // X形图案替代+形
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
    // 第二轮训练记录已完成的图案类型
    else if (roundGroup === 2 || progress.currentRoundGroup === 2) {
        // 初始化第二轮完成的图案记录
        if (!progress.secondRoundCompleted) progress.secondRoundCompleted = [];
        
        // 记录已完成的图案信息
        progress.secondRoundCompleted.push({
            type: patternType,
            timeUsed: timeUsed
        });
    }
    // 第三轮训练记录
    else if (roundGroup === 3 || progress.currentRoundGroup === 3) {
        if (!progress.thirdRoundCompleted) progress.thirdRoundCompleted = [];
        
        progress.thirdRoundCompleted.push({
            type: patternType,
            timeUsed: timeUsed
        });
        
        // 记录第三轮用时用于后续比较
        const thirdRoundTimes = uni.getStorageSync('thirdRoundTimes') || {};
        thirdRoundTimes[patternType] = timeUsed;
        uni.setStorageSync('thirdRoundTimes', thirdRoundTimes);
    }
    
    // 检查轮次变化 - 修复轮次隔离问题
    console.log(`当前状态：当前轮次 ${progress.currentRoundGroup}，已完成总数 ${progress.completedCount}，当前轮次已完成 ${progress.completedInRound}`);
    
    // 完成第6个训练项，进入第2大轮次
    if (progress.completedCount === 6 && progress.currentRoundGroup === 1) {
        progress.currentRoundGroup = 2;
        progress.completedInRound = 0;
        console.log("已完成第一轮6个训练，进入第二轮次");
        
        // 强制清空并完全重建选择池，确保有6个图案
        uni.removeStorageSync('selectionPool');
        updateSelectionPoolForNewRound(2);
    } 
    // 完成第12个训练项，进入第3大轮次
    else if (progress.completedCount === 12 && progress.currentRoundGroup === 2) {
        progress.currentRoundGroup = 3;
        progress.completedInRound = 0;
        console.log("已完成第二轮6个训练，进入第三轮次");
        
        // 强制清空并完全重建选择池，确保有6个图案
        uni.removeStorageSync('selectionPool');
        updateSelectionPoolForNewRound(3);
    }
    // 完成第18个训练项，进入第4大轮次
    else if (progress.completedCount === 18 && progress.currentRoundGroup === 3) {
        progress.currentRoundGroup = 4;
        progress.completedInRound = 0;
        progress.thirdRoundCompleted = true;
        console.log("已完成第三轮6个训练，进入第四轮次（比较测试）");
        
        // 强制清空选择池，确保第三轮图案不会显示
        uni.removeStorageSync('selectionPool');
        
        // 添加轮次分隔标记，确保下次加载时重新生成第四轮图案
        uni.setStorageSync('readyForRound4', true);
        uni.setStorageSync('forceGenerateRound4', true); // 添加强制生成标记
    }
    
    // 完成第24个训练项，才真正标记训练完成
    else if (progress.completedCount === 24 && progress.currentRoundGroup === 4) {
        progress.isCompleted = true;
        console.log("已完成全部24次训练，训练结束！");
        
        // 计算第一轮和第四轮的时间比值
        calculateTimeRatios();
    }
    
    uni.setStorageSync('trainingProgress', progress);
    return progress;
}

/**
 * 为新的轮次更新选择池
 * @param {number} roundGroup 新的轮次编号
 */
export function updateSelectionPoolForNewRound(roundGroup) {
    console.log(`完全重建第${roundGroup}轮选择池`);
    
    // 彻底清空现有选择池
    uni.removeStorageSync('selectionPool');
    
    if (roundGroup === 1) {
        // 加载第一轮图案
        const initialPatterns = uni.getStorageSync('initialPatterns') || [];
        if (initialPatterns.length > 0) {
            const progress = getTrainingProgress();
            const completedTypes = Object.keys(progress.firstAppearanceTimes || {});
            
            // 过滤出未完成的图案
            const remainingPatterns = initialPatterns.filter(p => 
                !completedTypes.includes(p.type)
            );
            
            uni.setStorageSync('selectionPool', remainingPatterns);
            console.log(`已为第一轮恢复 ${remainingPatterns.length} 个未完成的图案`);
        }
    } 
    else if (roundGroup === 2) {
        // 加载第二轮次的图案（第一轮次图案的副本）
        const secondRoundPatterns = uni.getStorageSync('secondRoundPatterns') || [];
        if (secondRoundPatterns.length > 0) {
            uni.setStorageSync('selectionPool', [...secondRoundPatterns]);
            console.log(`已为第二轮加载 ${secondRoundPatterns.length} 个图案`);
        }
    } 
    else if (roundGroup === 3) {
        // 加载第三轮次的图案
        const thirdRoundPatterns = uni.getStorageSync('thirdRoundPatterns') || [];
        if (thirdRoundPatterns.length > 0) {
            uni.setStorageSync('selectionPool', [...thirdRoundPatterns]);
            console.log(`已为第三轮加载 ${thirdRoundPatterns.length} 个图案`);
        }
    } 
    else if (roundGroup === 4) {
        // 第四轮由 selection.vue 中的特殊处理生成和加载
        console.log("第四轮图案将在选择页面中生成");
    }
}

/**
 * 从选择池中移除已训练的图案，确保每轮最多有6个图案
 */
export function updateSelectionPool(pattern) {
    let pool = uni.getStorageSync('selectionPool') || [];
    const progress = getTrainingProgress();
    const MAX_POOL_SIZE = 6; // 选择池中最多显示6个图案
    
    // 注释掉移除图案的代码，保留所有图案
    // if (pattern && pattern.type) {
    //     pool = pool.filter(p => p.type !== pattern.type);
    // }
    
    // 严格确保选择池中只有当前轮次的图案
    pool = pool.filter(p => p.roundGroup === progress.currentRoundGroup);
    
    // 特别处理第一轮的情况，确保显示全部第一轮图案
    if (progress.currentRoundGroup === 1) {
        // 获取初始图案
        const initialPatterns = uni.getStorageSync('initialPatterns') || [];
        if (initialPatterns.length > 0) {
            // 不再过滤掉已完成的图案
            pool = initialPatterns;
            console.log(`第一轮选择池重建完成，共有 ${pool.length} 个图案`);
        }
    }
    // 处理第二轮
    else if (progress.currentRoundGroup === 2) {
        // 获取第二轮图案
        const secondRoundPatterns = uni.getStorageSync('secondRoundPatterns') || [];
        // 不再过滤掉已完成的图案
        pool = secondRoundPatterns;
        console.log(`第二轮选择池重建完成，共有 ${pool.length} 个图案`);
    }
    // 处理第三轮
    else if (progress.currentRoundGroup === 3) {
        // 获取第三轮图案
        const thirdRoundPatterns = uni.getStorageSync('thirdRoundPatterns') || [];
        // 不再过滤掉已完成的图案
        pool = thirdRoundPatterns;
        console.log(`第三轮选择池重建完成，共有 ${pool.length} 个图案`);
    }
    
    // 确保池中图案数量不超过最大限制
    if (pool.length > MAX_POOL_SIZE) {
        pool = pool.slice(0, MAX_POOL_SIZE);
    }
    
    uni.setStorageSync('selectionPool', pool);
    return pool;
}

/**
 * 检查图案是否已完成训练
 * @param {Object} pattern 图案对象
 * @returns {boolean} 是否已完成
 */
export function isPatternCompleted(pattern) {
    if (!pattern) return false;
    
    const progress = getTrainingProgress();
    
    // 第一轮检查
    if (pattern.roundGroup === 1) {
        return Object.keys(progress.firstAppearanceTimes || {}).includes(pattern.type);
    }
    // 第二轮检查
    else if (pattern.roundGroup === 2) {
        return (progress.secondRoundCompleted || []).some(p => p.type === pattern.type);
    }
    // 第三轮检查
    else if (pattern.roundGroup === 3) {
        return (progress.thirdRoundCompleted || []).some(p => p.type === pattern.type);
    }
    // 第四轮检查
    else if (pattern.roundGroup === 4) {
        const fourthRoundTimes = uni.getStorageSync('fourthRoundTimes') || {};
        return Object.keys(fourthRoundTimes).includes(pattern.type);
    }
    
    return false;
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

    // 为第一轮次添加标记
    const markedFirstRoundPatterns = firstRoundPatterns.map(pattern => ({
        ...pattern,
        isFirstAppearance: true,
        roundGroup: 1 // 标记为第1大轮次
    }));
    
    // 为第二轮准备第一轮图案的副本，但保持6个图案
    const secondRoundPatterns = firstRoundPatterns.map(pattern => ({
        ...pattern,
        isFirstAppearance: false,
        roundGroup: 2 // 标记为第2大轮次
    }));
    
    // 随机打乱第二轮次顺序
    shuffleArray(secondRoundPatterns);
    
    // 为第三轮准备第一轮图案的另一个副本
    const thirdRoundPatterns = firstRoundPatterns.map(pattern => ({
        ...pattern,
        isFirstAppearance: false,
        roundGroup: 3 // 标记为第3大轮次
    }));
    
    // 随机打乱第三轮次顺序
    shuffleArray(thirdRoundPatterns);

    // 保存所有轮次的图案
    uni.setStorageSync('initialPatterns', markedFirstRoundPatterns);
    
    // 确保选择池被正确设置
    uni.setStorageSync('selectionPool', [...markedFirstRoundPatterns]); // 设置为完整的浅拷贝
    
    uni.setStorageSync('secondRoundPatterns', secondRoundPatterns);
    uni.setStorageSync('thirdRoundPatterns', thirdRoundPatterns);

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
    
    console.log(`初始化训练完成，生成第一轮图案 ${markedFirstRoundPatterns.length} 个`);

    return {
        firstRoundPatterns,
        secondRoundPatterns,
        thirdRoundPatterns
    };
}

/**
 * 获取当前选择池中的图案
 * @returns {Array} 当前可选择的图案数组
 */
export function getSelectionPool() {
    const pool = uni.getStorageSync('selectionPool') || [];
    // 如果选择池为空，尝试重新获取
    if (pool.length === 0) {
        const progress = getTrainingProgress();
        
        // 第一轮时，尝试获取初始图案
        if (progress.currentRoundGroup === 1) {
            const initialPatterns = uni.getStorageSync('initialPatterns') || [];
            if (initialPatterns.length > 0) {
                console.log('选择池为空，重新加载初始图案');
                uni.setStorageSync('selectionPool', initialPatterns);
                return initialPatterns;
            }
        }
    }
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