Page({
  data: {
    activeTab: 0,
    phone: '',
    password: '',
    adminAccount: '',
    staffId: '',
    loading: false,
    showRegisterModal: false,
    regPhone: '',
    regPassword: '',
    regName: '',
    idCard: '',
    regLoading: false,
    regGender: '',
    regBirthDate: '',
    showResetModal: false,
    resetPhone: '',
    resetPassword: '',
    resetLoading: false
  },
  goHome() {
    wx.reLaunch({ url: '/pages/index/index' });
  },
  onPhoneInput(e) { this.setData({ phone: e.detail.value }); },
  onPasswordInput(e) { this.setData({ password: e.detail.value }); },
  onAdminAccountInput(e) { this.setData({ adminAccount: e.detail.value }); },
  onStaffIdInput(e) { this.setData({ staffId: e.detail.value }); },
  switchTab(e) { this.setData({ activeTab: Number(e.currentTarget.dataset.index) }); },
  handleLogin() {
    const { activeTab, phone, password, adminAccount, staffId } = this.data;
    if (activeTab === 0) {
      if (!phone || !password) {
        wx.showToast({ title: '请输入手机号和密码', icon: 'none' }); return;
      }
      this.setData({ loading: true });
      wx.request({
        url: 'http://127.0.0.1:3000/api/patient/login',
        method: 'POST',
        data: { phone, password },
        success: (res) => {
          this.setData({ loading: false });
          if (res.data.code === 0) {
            wx.setStorageSync('userInfo', res.data.data);
            wx.redirectTo({ url: '/pages/index/index' });
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' });
          }
        },
        fail: () => {
          this.setData({ loading: false });
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    } else if (activeTab === 1) {
      if (!staffId || !password) {
        wx.showToast({ title: '请输入工号和密码', icon: 'none' }); return;
      }
      this.setData({ loading: true });
      wx.request({
        url: 'http://127.0.0.1:3000/api/doctor/login',
        method: 'POST',
        data: { staffId, password },
        success: (res) => {
          this.setData({ loading: false });
          if (res.data.code === 0) {
            wx.setStorageSync('userInfo', res.data.data);
            wx.redirectTo({ url: '/pages/doctor/dashboard' });
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' });
          }
        },
        fail: () => {
          this.setData({ loading: false });
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    } else if (activeTab === 2) {
      if (!adminAccount || !password) {
        wx.showToast({ title: '请输入账号和密码', icon: 'none' }); return;
      }
      this.setData({ loading: true });
      wx.request({
        url: 'http://127.0.0.1:3000/api/admin/login',
        method: 'POST',
        data: { adminAccount, password },
        success: (res) => {
          this.setData({ loading: false });
          if (res.data.code === 0) {
            wx.setStorageSync('userInfo', res.data.data);
            wx.redirectTo({ url: '/pages/admin/dashboard' });
          } else {
            wx.showToast({ title: res.data.msg, icon: 'none' });
          }
        },
        fail: () => {
          this.setData({ loading: false });
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    }
  },
  toRegister() { this.setData({ showRegisterModal: true }); },
  closeModalByMask(e) {
    // 只允许点击遮罩关闭，点击内容不关闭
    if (e.target === e.currentTarget) {
      this.setData({ showRegisterModal: false });
    }
  },
  closeModal() { this.setData({ showRegisterModal: false }); },
  noop() {},

  // 注册表单输入
  onRegPhoneInput(e) { this.setData({ regPhone: e.detail.value }); },
  onRegPasswordInput(e) { this.setData({ regPassword: e.detail.value }); },
  onRegNameInput(e) { this.setData({ regName: e.detail.value }); },
  onIdCardInput(e) { this.setData({ idCard: e.detail.value }); },
  onRegGenderChange(e) {
    this.setData({ regGender: ['男','女'][e.detail.value] });
  },
  onRegBirthDateInput(e) {
    this.setData({ regBirthDate: e.detail.value });
  },

  // 注册提交
  handleRegister() {
    const { regPhone, regPassword, regName, idCard, regGender, regBirthDate } = this.data;
    if (!regPhone || !regPassword || !regName || !idCard || !regGender || !regBirthDate) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' }); return;
    }
    this.setData({ regLoading: true });
    wx.request({
      url: 'http://127.0.0.1:3000/api/patient/add',
      method: 'POST',
      data: {
        phone: regPhone,
        password: regPassword,
        name: regName,
        id_card: idCard,
        gender: regGender,
        birth_date: regBirthDate
      },
      success: (res) => {
        this.setData({ regLoading: false });
        if (res.data.code === 0) {
          wx.showToast({ title: '注册成功', icon: 'success' });
          this.setData({ showRegisterModal: false });
        } else {
          wx.showToast({ title: res.data.msg || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        this.setData({ regLoading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
  forgotPassword() {
    this.setData({ showResetModal: true, resetPhone: '', resetPassword: '', resetLoading: false });
  },
  closeResetByMask(e) {
    if (e.target === e.currentTarget) {
      this.setData({ showResetModal: false });
    }
  },
  closeResetModal() {
    this.setData({ showResetModal: false });
  },
  onResetPhoneInput(e) {
    this.setData({ resetPhone: e.detail.value });
  },
  onResetPasswordInput(e) {
    this.setData({ resetPassword: e.detail.value });
  },
  handleResetPassword() {
    const { resetPhone, resetPassword } = this.data;
    if (!resetPhone || !resetPassword) {
      wx.showToast({ title: '请填写手机号和新密码', icon: 'none' }); return;
    }
    this.setData({ resetLoading: true });
    wx.request({
      url: 'http://127.0.0.1:3000/api/patient/reset_password',
      method: 'POST',
      data: { phone: resetPhone, password: resetPassword },
      success: (res) => {
        this.setData({ resetLoading: false });
        if (res.data.code === 0) {
          wx.showToast({ title: '重置成功', icon: 'success' });
          this.setData({ showResetModal: false });
        } else {
          wx.showToast({ title: res.data.msg || '重置失败', icon: 'none' });
        }
      },
      fail: () => {
        this.setData({ resetLoading: false });
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },
});