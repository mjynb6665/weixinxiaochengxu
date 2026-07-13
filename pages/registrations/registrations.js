// pages/registrations/registrations.js
Page({
  /**
   * 页面的初始数据
   */
  data: { list: [] },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }
    wx.request({
      url: 'http://127.0.0.1:3000/api/registration/list',
      data: { patient_id: userInfo.id },
      success: (res) => {
        console.log('接口返回:', res.data);
        if (res.data.code === 0 && Array.isArray(res.data.data)) {
          this.setData({ list: res.data.data });
        } else {
          this.setData({ list: [] });
          wx.showToast({ title: '暂无挂号记录', icon: 'none' });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 取消挂号
   */
  cancelRegistration(e) {
    const regId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该挂号并退款吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'http://127.0.0.1:3000/api/registration/cancel',
            method: 'POST',
            data: { id: regId },
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({ title: '已取消并退款', icon: 'success' });
                this.onLoad(); // 重新加载列表
              } else {
                wx.showToast({ title: res.data.msg, icon: 'none' });
              }
            }
          });
        }
      }
    });
  }
})