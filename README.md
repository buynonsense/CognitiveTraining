# CognitiveTraining
Cognitive Training is a mobile app that boosts memory skills. Users find patterns in a 5x5 grid through 24 tasks, with automatic evaluations suitable for all ages.

# 认知训练应用

一款基于科学原理设计的认知能力训练与评估应用，专注于提升用户的工作记忆能力。

## 项目概述

认知训练应用通过简单而有效的图形识别任务，科学地评估和训练用户的记忆能力。用户需要记忆并在5x5数字网格中找出特定的图形，系统会根据完成时间和准确率进行评分和评估。

### 用户信息管理

在开始训练前，用户需填写基本信息，包括：
- **必填项**：姓名、出生日期、性别、电话
- **选填项**：职业、学历等

用户信息用于生成个性化的训练方案，并在最终评估中提供参考。

### 训练流程

训练过程分为四个大阶段，总共包含24次训练任务：

1. **第一轮**：6个基础图案，用于建立基准评分
2. **第二轮**：复用第一轮图案，顺序打乱，进一步巩固记忆
3. **第三轮**：再次复用第一轮图案，顺序打乱，用于测试记忆提升能力
4. **第四轮**：6个全新图案，用于最终比较测试

### 评分规则

- 0~10秒完成：3分
- 10~15秒完成：2分
- 15~30秒完成：1分
- 超过30秒：0分

### 记忆能力评估

根据第一轮的18分满分评估记忆力水平：
- 14~18分：记忆力正常
- 9~13分：记忆力较弱
- 5~8分：记忆力弱
- 小于5分：记忆力缺陷

### 记忆提升评估

通过比较第一轮和第三轮的完成时间，计算记忆提升比值：
- 20~30%：记忆力正常
- 10~20%：记忆力较弱
- 0~10%：记忆力弱
- 小于0%：记忆力缺陷

## 技术架构

- 前端框架：Vue.js
- 跨平台支持：uni-app
- UI组件库：WeiDian UI
- 存储方案：本地存储

## 安装与运行

### 环境要求

- Node.js 12.0+  
- HBuilderX 3.0+（推荐）

### 安装步骤

1. 克隆项目代码
```bash
git clone https://github.com/buynonsense/CognitiveTraining.git
cd cognitivetraining
```

2. 安装依赖
```bash
npm install
```

3. 开发模式运行
```bash
# H5平台
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin

# APP
npm run dev:app
```

4. 生产环境构建
```bash
# H5平台
npm run build:h5

# 微信小程序
npm run build:mp-weixin

# APP
npm run build:app
```

## 项目结构

```
cognitivetraining/
├── src/
│   ├── pages/                 # 页面文件
│   │   ├── index/             # 首页
│   │   ├── userInfo/          # 用户信息填写页
│   │   ├── selection/         # 图形选择页
│   │   ├── training/          # 训练计时页
│   │   ├── result/            # 单次训练结果页
│   │   └── finalResult/       # 最终评估结果页
│   ├── utils/
│   │   └── patternUtils.js    # 图形生成与评估工具
│   ├── components/            # 公共组件
│   ├── static/                # 静态资源
│   ├── App.vue                # 应用入口组件
│   ├── main.js                # 应用入口JS
│   └── pages.json             # 页面路由配置
├── package.json
├── README.md
└── ...配置文件
```

## 使用说明

1. 打开应用，填写个人信息并点击"开始训练"
2. 从6个图形中选择一个，记住其形状和数字
3. 在5x5网格中找出并点击对应的图形位置
4. 查看训练结果，继续下一轮训练
5. 完成24次训练后，查看最终记忆力评估结果
