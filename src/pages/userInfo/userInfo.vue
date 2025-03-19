<template>
  <view class="container">
    <view class="header">
      <view class="title">个人信息</view>
      <view class="subtitle">请填写您的基本信息以开始训练</view>
    </view>
    
    <view class="form-container">
      <view class="form-item">
        <text class="label">姓名 <text class="required">*</text></text>
        <input v-model="userInfo.name" class="input" placeholder="请输入姓名" />
        <text v-if="errors.name" class="error-tip">{{ errors.name }}</text>
      </view>

      <view class="form-item">
        <text class="label">出生日期 <text class="required">*</text></text>
        <view class="date-picker" @click="showDatePicker">
          <text :class="['date-text', !userInfo.birthDate ? 'placeholder' : '']">
            {{ userInfo.birthDate || '请选择出生日期' }}
          </text>
        </view>
        <text v-if="errors.birthDate" class="error-tip">{{ errors.birthDate }}</text>
      </view>

      <view class="form-item">
        <text class="label">性别 <text class="required">*</text></text>
        <view class="gender-selector">
          <view :class="['gender-option', userInfo.gender === '男' ? 'selected' : '']" @click="setGender('男')">
            男
          </view>
          <view :class="['gender-option', userInfo.gender === '女' ? 'selected' : '']" @click="setGender('女')">
            女
          </view>
        </view>
        <text v-if="errors.gender" class="error-tip">{{ errors.gender }}</text>
      </view>

      <view class="form-item">
        <text class="label">电话号码 <text class="required">*</text></text>
        <input v-model="userInfo.phone" class="input" placeholder="请输入电话号码" type="number" maxlength="11" />
        <text v-if="errors.phone" class="error-tip">{{ errors.phone }}</text>
      </view>

      <view class="form-item">
        <text class="label">职业</text>
        <input v-model="userInfo.occupation" class="input" placeholder="请输入您的职业" />
      </view>

      <view class="form-item">
        <text class="label">学历</text>
        <picker @change="educationChange" :value="educationIndex" :range="educationLevel">
          <view class="picker">
            {{ userInfo.education || '请选择您的最高学历' }}
          </view>
        </picker>
      </view>

      <view class="form-item">
        <text class="label">教育经历</text>
        <textarea v-model="userInfo.educationExp" class="textarea" placeholder="请简要描述您的教育经历，如：学校、专业、起止时间" />
      </view>
    </view>

    <view class="btn-container">
      <wd-button type="primary" class="submit-btn" @click="submitInfo">开始训练</wd-button>
    </view>

    <!-- 日期选择器弹窗 -->
    <wd-popup v-model="datePickerVisible" position="bottom">
      <view class="date-picker-container">
        <view class="picker-header">
          <text @click="cancelDatePicker">取消</text>
          <text @click="confirmDatePicker">确定</text>
        </view>
        <picker-view :value="dateValue" @change="dateChange" class="picker-view">
          <picker-view-column>
            <view class="picker-item" v-for="year in years" :key="year">{{ year }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="month in months" :key="month">{{ month }}月</view>
          </picker-view-column>
          <picker-view-column>
            <view class="picker-item" v-for="day in days" :key="day">{{ day }}日</view>
          </picker-view-column>
        </picker-view>
      </view>
    </wd-popup>
  </view>
</template>

<script>
import { initializeTraining } from '@/utils/patternUtils';

export default {
  data() {
    // 生成年、月、日选项
    const generateYears = () => {
      const years = [];
      const currentYear = new Date().getFullYear();
      for (let i = currentYear - 125; i <= currentYear; i++) {
        years.push(i);
      }
      return years;
    };

    return {
      userInfo: {
        name: '',
        birthDate: '',
        gender: '',
        phone: '',
        occupation: '',
        education: '',
        educationExp: ''
      },
      errors: {
        name: '',
        birthDate: '',
        gender: '',
        phone: ''
      },
      datePickerVisible: false,
      years: generateYears(),
      months: Array.from({length: 12}, (_, i) => i + 1),
      days: Array.from({length: 31}, (_, i) => i + 1),
      dateValue: [50, 0, 0], // 默认选中的年、月、日索引
      tempDateValue: [50, 0, 0],
      educationLevel: ['小学', '初中', '高中', '大专', '本科', '硕士', '博士'],
      educationIndex: 0
    };
  },
  watch: {
    // 监听日期选择变化，动态调整天数
    'tempDateValue': {
      handler(newVal) {
        const year = this.years[newVal[0]];
        const month = this.months[newVal[1]];
        this.updateDays(year, month);
        
        // 如果当前选择的日期超出了调整后的天数，则修正
        const maxDay = this.days.length;
        if (newVal[2] >= maxDay) {
          this.tempDateValue[2] = maxDay - 1;
        }
      },
      deep: true
    }
  },
  methods: {
    // 更新天数数组
    updateDays(year, month) {
      let daysInMonth;
      
      // 判断月份对应的天数
      if ([4, 6, 9, 11].includes(month)) {
        // 小月30天
        daysInMonth = 30;
      } else if (month === 2) {
        // 2月份需判断平年闰年
        daysInMonth = this.isLeapYear(year) ? 29 : 28;
      } else {
        // 大月31天
        daysInMonth = 31;
      }
      
      // 更新天数数组
      this.days = Array.from({length: daysInMonth}, (_, i) => i + 1);
    },
    
    // 判断是否闰年
    isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    },
    
    showDatePicker() {
      // 显示日期选择器时，先更新一次天数
      const year = this.years[this.tempDateValue[0]];
      const month = this.months[this.tempDateValue[1]];
      this.updateDays(year, month);
      
      this.datePickerVisible = true;
    },
    
    dateChange(e) {
      this.tempDateValue = e.detail.value;
    },
    
    cancelDatePicker() {
      this.datePickerVisible = false;
    },
    
    confirmDatePicker() {
      this.dateValue = [...this.tempDateValue];
      const year = this.years[this.dateValue[0]];
      const month = this.months[this.dateValue[1]].toString().padStart(2, '0');
      const day = this.days[this.dateValue[2]].toString().padStart(2, '0');
      this.userInfo.birthDate = `${year}-${month}-${day}`;
      this.validateForm('birthDate');
      this.datePickerVisible = false;
    },
    
    // ... 其他现有方法保持不变
    setGender(gender) {
      this.userInfo.gender = gender;
      this.validateForm('gender');
    },
    
    educationChange(e) {
      this.educationIndex = e.detail.value;
      this.userInfo.education = this.educationLevel[this.educationIndex];
    },
    
    validateForm(field = null) {
      let valid = true;
      
      // 只验证特定字段或验证所有必填字段
      if (!field || field === 'name') {
        if (!this.userInfo.name.trim()) {
          this.errors.name = '姓名不能为空';
          valid = false;
        } else {
          this.errors.name = '';
        }
      }
      
      if (!field || field === 'birthDate') {
        if (!this.userInfo.birthDate) {
          this.errors.birthDate = '请选择出生日期';
          valid = false;
        } else {
          this.errors.birthDate = '';
        }
      }
      
      if (!field || field === 'gender') {
        if (!this.userInfo.gender) {
          this.errors.gender = '请选择性别';
          valid = false;
        } else {
          this.errors.gender = '';
        }
      }
      
      if (!field || field === 'phone') {
        const phoneReg = /^1[3-9]\d{9}$/;
        if (!this.userInfo.phone) {
          this.errors.phone = '电话号码不能为空';
          valid = false;
        } else if (!phoneReg.test(this.userInfo.phone)) {
          this.errors.phone = '请输入有效的11位手机号码';
          valid = false;
        } else {
          this.errors.phone = '';
        }
      }
      
      return valid;
    },
    
    submitInfo() {
      // 验证表单
      if (!this.validateForm()) {
        uni.showToast({
          title: '请填写必填项',
          icon: 'none'
        });
        return;
      }
      
      // 保存用户信息到本地存储
      uni.setStorageSync('userInfo', this.userInfo);
      
      // 初始化训练并跳转到选择页面
      initializeTraining();
      
      uni.navigateTo({
        url: '/pages/selection/selection'
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
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  text-align: center;
  margin-bottom: 30rpx; /* 减小margin */
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 8rpx; /* 减小margin */
}

.subtitle {
  font-size: 28rpx;
  color: #666;
}

.form-container {
  flex: 1;
  padding: 10rpx 0; /* 减小padding */
}

.form-item {
  margin-bottom: 20rpx; /* 减小item间距 */
}

.label {
  font-size: 28rpx;
  margin-bottom: 6rpx; /* 减小margin */
  display: block;
}

.required {
  color: #f56c6c;
}

.input, .picker, .date-picker {
  width: 100%;
  height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
}

.textarea {
  width: 100%;
  height: 160rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.placeholder {
  color: #999;
}

.gender-selector {
  display: flex;
  gap: 20rpx;
}

.gender-option {
  flex: 1;
  height: 80rpx;
  background-color: #f8f8f8;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.selected {
  background-color: #409EFF;
  color: white;
}

.error-tip {
  font-size: 24rpx;
  color: #f56c6c;
  margin-top: 10rpx;
}

.date-picker-container {
  background-color: #fff;
  padding-bottom: 30rpx;
}

.picker-header {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  border-bottom: 1px solid #eee;
}

.picker-header text {
  font-size: 30rpx;
}

.picker-header text:first-child {
  color: #999;
}

.picker-header text:last-child {
  color: #409EFF;
}

.picker-view {
  height: 400rpx;
  width: 100%;
}

.picker-item {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
}

.btn-container {
  margin-top: 20rpx;
  padding: 10rpx 0;
  position: relative; /* 相对定位 */
  bottom: 0;
  width: 100%;
}

.submit-btn {
  width: 100%;
  height: 90rpx;
  border-radius: 45rpx;
  font-size: 32rpx;
}

/* 可选: 确保较长表单时按钮保持在底部可见 */
@media screen and (max-height: 1200px) {
  .form-item {
    margin-bottom: 15rpx;
  }
  
  .input, .picker, .date-picker, .gender-option {
    height: 70rpx; /* 减小输入框高度 */
  }
  
  .textarea {
    height: 120rpx; /* 减小文本框高度 */
  }
}
</style>