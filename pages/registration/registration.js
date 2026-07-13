// pages/appointment/index.js
Page({
  data: {
    departments: [
      {
        id: 1,
        name: '心血管内科',
        icon: '/images/dept-heart.png'
      },
      {
        id: 2,
        name: '呼吸内科',
        icon: '/images/dept-lung.png'
      }
    ],
    doctors: [
      {
        id: 101,
        name: '张明华',
        title: '主任医师',
        specialty: '冠心病介入治疗',
        hospital: '阳光医院总院',
        avatar: '/images/doctor-zhang.jpg'
      }
    ],
    isProxyRegistration: false,
    patientName: '',
    currentUser: null
  },
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({
      currentUser: userInfo
    });
  },

  toggleProxyRegistration(e) {
    this.setData({
      isProxyRegistration: e.detail.value,
      patientName: ''
    });
  },

  onPatientNameInput(e) {
    this.setData({
      patientName: e.detail.value
    });
  },

  navigateBack() {
    wx.navigateBack();
  },

  selectDepartment(e) {
    const deptId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/doctors/list?deptId=${deptId}`
    });
  },

  viewDoctorDetail(e) {
    const doctorId = e.currentTarget.dataset.id;
    const query = `id=${doctorId}`;
    
    if (this.data.isProxyRegistration && this.data.patientName) {
      query += `&isProxy=1&patientName=${this.data.patientName}`;
    }
    
    wx.navigateTo({
      url: `/pages/doctor/detail?${query}`
    });
  },

  submitRegistration(doctorId, departmentId, date, timeSlot) {
    const data = {
      doctor_id: doctorId,
      department_id: departmentId,
      date: date,
      time_slot: timeSlot,
      pay_type: 'online'
    };

    if (!this.data.currentUser || !this.data.currentUser.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    if (this.data.isProxyRegistration) {
      if (!this.data.patientName) {
        wx.showToast({
          title: '请输入就诊人姓名',
          icon: 'none'
        });
        return;
      }
      data.patient_name = this.data.patientName;
      data.proxy_patient_id = this.data.currentUser.id;
    } else {
      data.patient_id = this.data.currentUser.id;
    }

    wx.showLoading({
      title: '提交中...',
      mask: true
    });

    wx.request({
      url: 'http://127.0.0.1:3000/api/registration/add',
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '挂号成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/registration/detail?id=${res.data.id}`
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg || '挂号失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  }
});