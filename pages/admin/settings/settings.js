Page({
  data: {
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    notifyTypes: ['短信', '微信', '邮件'],
    registerNotifyIndex: 0,
    visitNotifyIndex: 0,
    payTypes: ['微信', '支付宝', '医保卡', '现金'],
    selectedPayTypes: [],
    maxRegCount: '',
    allowCancel: true
  },

  onHospitalNameInput(e) { this.setData({ hospitalName: e.detail.value }); },
  onHospitalAddressInput(e) { this.setData({ hospitalAddress: e.detail.value }); },
  onHospitalPhoneInput(e) { this.setData({ hospitalPhone: e.detail.value }); },
  onRegisterNotifyChange(e) { this.setData({ registerNotifyIndex: e.detail.value }); },
  onVisitNotifyChange(e) { this.setData({ visitNotifyIndex: e.detail.value }); },
  onPayTypeChange(e) { this.setData({ selectedPayTypes: e.detail.value }); },
  onMaxRegCountInput(e) { this.setData({ maxRegCount: e.detail.value }); },
  onAllowCancelChange(e) { this.setData({ allowCancel: e.detail.value }); },

  // 页面加载时获取设置
  onLoad() {
    wx.request({
      url: 'http://127.0.0.1:3000/api/settings',
      success: (res) => {
        if (res.data.code === 0 && res.data.data) {
          const d = res.data.data;
          this.setData({
            hospitalName: d.hospital_name,
            hospitalAddress: d.hospital_address,
            hospitalPhone: d.hospital_phone,
            registerNotifyIndex: this.data.notifyTypes.indexOf(d.register_notify_type),
            visitNotifyIndex: this.data.notifyTypes.indexOf(d.visit_notify_type),
            maxRegCount: d.max_reg_count,
            allowCancel: !!d.allow_cancel,
            // 关键：同步数据库支付方式到 selectedPayTypes
            selectedPayTypes: d.pay_types ? d.pay_types.split(',') : []
          });
        }
      }
    });
  },

  // 一次性保存所有设置
  saveAllSettings() {
    const uniquePayTypes = Array.from(new Set(this.data.selectedPayTypes));
    // 保存前打印，便于调试
    console.log('将要保存的支付方式:', uniquePayTypes);
    wx.request({
      url: 'http://127.0.0.1:3000/api/settings',
      method: 'POST',
      data: {
        hospitalName: this.data.hospitalName,
        hospitalAddress: this.data.hospitalAddress,
        hospitalPhone: this.data.hospitalPhone,
        registerNotifyType: this.data.notifyTypes[this.data.registerNotifyIndex],
        visitNotifyType: this.data.notifyTypes[this.data.visitNotifyIndex],
        payTypes: uniquePayTypes.join(','),
        maxRegCount: this.data.maxRegCount,
        allowCancel: this.data.allowCancel ? 1 : 0
      },
      success: (res) => {
        wx.showToast({ title: res.data.msg || '保存成功', icon: 'success' });
        // 保存后刷新设置
        this.onLoad();
      }
    });
  },

  goBack() {
    wx.navigateBack();
  }
});