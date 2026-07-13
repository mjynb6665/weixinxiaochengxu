Page({
  data: {
    doctor: {},
    deptId: null, // 添加科室 ID
    isProxy: false,
    patientName: '',
    currentUser: null
  },
  onLoad(options) {
    // 获取当前用户信息
    const userInfo = wx.getStorageSync('userInfo');

    // 获取代理挂号信息
    const isProxy = options.isProxy === '1';
    const patientName = options.patientName || '';

    this.setData({
      isProxy,
      patientName,
      currentUser: userInfo
    });

    // 获取医生信息
    const doctorId = options.id;
    if (!doctorId) {
      wx.showToast({
        title: '缺少医生信息',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'http://127.0.0.1:3000/api/doctor/detail',
      data: { id: doctorId },
      success: (res) => {
        if (res.data.code === 0) {
          const doctor = res.data.data;
          const deptId = doctor.department_id; // 从医生信息中获取科室 ID
          this.setData({
            doctor: doctor,
            deptId: deptId // 设置科室 ID
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取医生信息失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },
  goRegistration() {
    // 检查登录状态
    if (!this.data.currentUser || !this.data.currentUser.id) {
        wx.showToast({
            title: '请先登录',
            icon: 'none'
        });
        return;
    }

    const departmentId = this.data.deptId; // 获取 department_id

    if (!departmentId) {
        wx.showToast({
            title: '科室ID为空',
            icon: 'none'
        });
        return;
    }

    let url = `/pages/register/register?doctorId=${this.data.doctor.id}&departmentId=${departmentId}`;

    // 如果是代理挂号，添加相关参数
    if (this.data.isProxy && this.data.patientName) {
        url += `&isProxy=1&patientName=${this.data.patientName}`;
    }

    wx.navigateTo({
        url: url
    });
  },
  goBack() {
    wx.navigateBack();
  }
});