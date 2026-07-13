Page({
  data: {
    regCount: 0,
    regDept: [],
    regDoctor: [],
    visitCount: 0,
    visitDept: [],
    visitDoctor: []
  },
  onLoad() {
    wx.request({
      url: 'http://127.0.0.1:3000/api/analysis/registration/count',
      success: res => this.setData({ regCount: res.data.total })
    });
    wx.request({
      url: 'http://127.0.0.1:3000/api/analysis/registration/department',
      success: res => this.setData({ regDept: res.data.data })
    });
    wx.request({
      url: 'http://127.0.0.1:3000/api/analysis/registration/doctor',
      success: res => this.setData({ regDoctor: res.data.data })
    });
    wx.request({
      url: 'http://127.0.0.1:3000/api/analysis/visit/count',
      success: res => this.setData({ visitCount: res.data.total })
    });
    wx.request({
      url: 'http://127.0.0.1:3000/api/analysis/visit/department',
      success: res => this.setData({ visitDept: res.data.data })
    });
    wx.request({
      url: 'http://127.0.0.1:3000/api/analysis/visit/doctor',
      success: res => this.setData({ visitDoctor: res.data.data })
    });
  },
  goBack() {
    wx.navigateBack();
  }
});