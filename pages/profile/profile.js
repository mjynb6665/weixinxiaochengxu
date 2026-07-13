// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null // 用null区分未登录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo');
    this.setData({ userInfo: userInfo && userInfo.id ? userInfo : null });
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
    const userInfo = wx.getStorageSync('userInfo');
    // 未登录自动跳转到登录页
    if (!userInfo || !userInfo.id) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }
    this.setData({ userInfo });
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

  // 跳转到编辑个人信息页面
  editProfile() {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },

  // 跳转到挂号记录页面
  viewRegistrations() {
    wx.navigateTo({ url: '/pages/registrations/registrations' });
  },

  // 跳转到就诊记录页面
  viewVisits() {
    wx.navigateTo({ url: '/pages/visits/visits' });
  },

  // 跳转到登录页面
  goLogin() {
    wx.navigateTo({ url: '/pages/login/login' });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  },

  // 退出登录
  logout() {
    wx.removeStorageSync('userInfo');
    wx.redirectTo({ url: '/pages/login/login' });
  }
});