Page({
  data: {
    registrations: [],
    statusList: ['全部', '待就诊', '已取消', '已完成'],
    selectedStatus: 0,
    selectedDate: '',
    showReportModal: false,
    reportContent: '',
    reportPatientId: null,
    reportDoctorId: null,
    loading: false,
    updating: false
  },
  onLoad() {
    this.searchRegistrations();
  },
  onStatusChange(e) {
    this.setData({ selectedStatus: e.detail.value });
  },
  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value });
  },
  searchRegistrations() {
    const status = this.data.selectedStatus === 0 ? '' : this.data.statusList[this.data.selectedStatus];
    
    if (this.loading) return;
    this.loading = true;
    
    wx.showLoading({
        title: '加载中...',
        mask: true
    });
    
    wx.request({
        url: 'http://127.0.0.1:3000/api/registrations',
        data: { status, date: this.data.selectedDate },
        success: (res) => {
            if (res.data.code === 0) {
                this.setData({ 
                    registrations: res.data.data 
                });
            } else {
                wx.showToast({
                    title: res.data.msg || '获取数据失败',
                    icon: 'none'
                });
            }
        },
        fail: (err) => {
            wx.showToast({
                title: '网络请求失败',
                icon: 'none'
            });
        },
        complete: () => {
            wx.hideLoading();
            this.loading = false;
        }
    });
  },
  goBack() {
    wx.navigateBack();
  },
  showUpdateStatus(e) {
    const id = e.currentTarget.dataset.id;
    wx.showActionSheet({
        itemList: ['待就诊', '已完成', '已取消'],
        success: (res) => {
            const statusArr = ['待就诊', '已完成', '已取消'];
            const status = statusArr[res.tapIndex];
            
            if (this.updating) return;
            this.updating = true;
            
            wx.showLoading({
                title: '更新中...',
                mask: true
            });
            
            wx.request({
                url: 'http://127.0.0.1:3000/api/registration/update_status',
                method: 'POST',
                data: { id, status },
                success: (res) => {
                    if (res.data.code === 0) {
                        wx.showToast({
                            title: '状态更新成功',
                            icon: 'success'
                        });
                        setTimeout(() => {
                            this.searchRegistrations();
                        }, 1500);
                    } else {
                        wx.showToast({
                            title: res.data.msg || '更新失败',
                            icon: 'none'
                        });
                    }
                },
                fail: () => {
                    wx.showToast({
                        title: '网络请求失败',
                        icon: 'none'
                    });
                },
                complete: () => {
                    wx.hideLoading();
                    this.updating = false;
                }
            });
        }
    });
  },
  showReportModal(e) {
    this.setData({
      showReportModal: true,
      reportPatientId: e.currentTarget.dataset.patient,
      reportDoctorId: e.currentTarget.dataset.doctor,
      reportContent: ''
    });
  },
  closeReportModal() {
    this.setData({ showReportModal: false });
  },
  onReportInput(e) {
    this.setData({ reportContent: e.detail.value });
  },
  submitReport() {
    const { reportPatientId, reportDoctorId, reportContent } = this.data;
    if (!reportContent) {
      wx.showToast({ title: '请输入报告内容', icon: 'none' });
      return;
    }
    wx.request({
      url: 'http://127.0.0.1:3000/api/reports/add',
      method: 'POST',
      data: {
        patient_id: reportPatientId,
        doctor_id: reportDoctorId,
        content: reportContent
      },
      success: () => {
        wx.showToast({ title: '上传成功' });
        this.setData({ showReportModal: false });
      }
    });
  }
});