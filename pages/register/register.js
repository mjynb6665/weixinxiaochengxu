Page({
  data: {
    doctorId: null,
    departmentId: null,
    date: '',
    timeSlots: ['上午', '下午', '晚上'],
    timeIndex: 0,
    payTypes: [], // 动态支付方式
    payType: '', // 当前选中的支付方式
    isProxy: false, // 是否为代理挂号
    patientName: '', // 被代理人姓名
    currentUser: null // 当前登录用户
  },
  onLoad(options) {
    console.log('options:', options); // 输出 options 对象
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      doctorId: options.doctorId,
      departmentId: options.departmentId, // 接收 departmentId
      currentUser: userInfo
    });
    wx.request({
      url: 'http://127.0.0.1:3000/api/settings',
      success: (res) => {
        if (res.data.code === 0 && res.data.data) {
          let payTypes = res.data.data.pay_types ? res.data.data.pay_types.split(',') : [];
          payTypes = payTypes.map(s => s.trim()).filter(s => !!s);
          payTypes = Array.from(new Set(payTypes));
          this.setData({
            payTypes,
            payType: payTypes.length > 0 ? payTypes[0] : ''
          });
        }
      }
    });
  },
  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  setMaxRegistrations(e) {
    var doctorId = e.currentTarget.dataset.id;
    var maxRegistrations = e.detail.value;
    wx.request({
      url: 'http://127.0.0.1:3000/api/doctors/setMaxRegistrations',
      method: 'POST',
      data: { id: doctorId, max_registrations: maxRegistrations },
      success: function(res) {
        if (res.data.code === 0) {
          wx.showToast({ title: '设置成功', icon: 'success' });
        } else {
          wx.showToast({ title: '设置失败', icon: 'none' });
        }
      }
    });
  },
  onTimeChange(e) {
    this.setData({ timeIndex: e.detail.value });
  },
  onPayTypeChange(e) {
    this.setData({ payType: e.detail.value });
  },
  toggleProxyRegistration(e) {
    this.setData({
      isProxy: e.detail.value,
      patientName: '' // 切换时清空名字
    });
  },

  onPatientNameInput(e) {
    this.setData({
      patientName: e.detail.value
    });
  },

  submitregistration() {
    if (!this.data.currentUser || !this.data.currentUser.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    const { doctorId, departmentId, date, timeSlots, timeIndex, payType, isProxy, patientName, currentUser } = this.data;

    // 检查必要参数
    if (!doctorId || !departmentId) {
      wx.showToast({
        title: '缺少医生或科室信息',
        icon: 'none'
      });
      return;
    }

    if (!date) {
      wx.showToast({
        title: '请选择就诊日期',
        icon: 'none'
      });
      return;
    }

    // 检查日期是否合法（不能选择过去的日期）
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      wx.showToast({
        title: '不能选择过去的日期',
        icon: 'none'
      });
      return;
    }

    if (!payType) {
      wx.showToast({
        title: '请选择支付方式',
        icon: 'none'
      });
      return;
    }

    // 检查代理挂号信息
    if (isProxy && !patientName) {
      wx.showToast({
        title: '请输入就诊人姓名',
        icon: 'none'
      });
      return;
    }

    // 检查挂号数量
    wx.request({
        url: 'http://127.0.0.1:3000/api/registration/check',
        data: {
            doctor_id: doctorId,
            department_id: departmentId,
            date: date,
            time_slot: timeSlots[timeIndex]
        },
        success: (res) => {
            if (res.data.code === 0 && res.data.data.available > 0) {
                // 准备挂号数据
                const registrationData = {
                    doctor_id: doctorId,
                    department_id: departmentId,
                    date: date,
                    time_slot: timeSlots[timeIndex],
                    pay_type: payType
                };

                // 根据是否代理挂号添加不同的参数
                if (isProxy) {
                    registrationData.patient_name = patientName;
                    registrationData.proxy_patient_id = currentUser.id;
                } else {
                    registrationData.patient_id = currentUser.id;
                }

                wx.showLoading({ title: '挂号中...' });
                
                // 提交挂号（支付在后台完成）
                wx.request({
                    url: 'http://127.0.0.1:3000/api/registration/add',
                    method: 'POST',
                    data: registrationData,
                    timeout: 10000, // 设置超时时间为 10 秒
                    success: (res) => {
                        wx.hideLoading();
                        if (res.data.code === 0) {
                            // 直接显示成功，不再调用支付接口
                            wx.showModal({
                                title: '挂号成功',
                                content: '您已完成挂号并支付，可以在"我的挂号"中查看详情',
                                showCancel: false,
                                success: () => {
                                    wx.redirectTo({
                                        url: '/pages/registrations/registrations'
                                    });
                                }
                            });
                        } else {
                            wx.showToast({
                                title: res.data.msg || '挂号失败',
                                icon: 'none'
                            });
                        }
                    },
                    fail: (err) => {
                        wx.hideLoading();
                        wx.showToast({
                            title: '网络错误或请求超时',
                            icon: 'none'
                        });
                        console.error('Request failed:', err); // 记录错误信息
                    }
                });
            } else {
                // 如果没有可用的挂号名额，显示错误消息
                wx.showToast({ title: '当前时间段挂号名额已满', icon: 'none' });
            }
        },
        fail: () => {
            wx.showToast({ title: '网络错误', icon: 'none' });
        }
    });
  },
  getPayTypeName() {
    switch (this.data.payType) {
      case '微信': return '微信支付';
      case '支付宝': return '支付宝支付';
      case '医保卡': return '医保卡支付';
      case '现金': return '现金支付';
      default: return '支付';
    }
  },
  goBack() {
    wx.navigateBack();
  }
});