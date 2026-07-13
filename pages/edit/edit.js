Page({
  data: {
    userInfo: {}
  },
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({ userInfo });
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`userInfo.${field}`]: e.detail.value });
  },
  saveProfile() {
    wx.request({
      url: 'http://127.0.0.1:3000/api/patient/update',
      method: 'POST',
      data: this.data.userInfo,
      success: (res) => {
        if (res.data.code === 0) {
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => { wx.navigateBack(); }, 800);
        } else {
          wx.showToast({ title: res.data.msg || '保存失败', icon: 'none' });
        }
      }
    });
  },
  goBack() {
    wx.navigateBack();
  }
});