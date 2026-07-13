Page({
    data: {
        doctors: [],
        deptId: null,
        loading: true
    },
    onLoad(options) {
        const deptId = options.deptId;
        this.setData({ deptId });
        this.loadDoctors(deptId);
    },

    loadDoctors(deptId) {
        this.setData({ loading: true });

        wx.request({
            url: 'http://127.0.0.1:3000/api/doctors',
            data: { department_id: deptId },
            success: (res) => {
                if (res.data.code === 0) {
                    this.setData({
                        doctors: res.data.data.map(doctor => ({
                            ...doctor,
                            scheduleArray: doctor.schedule ? doctor.schedule.split(',').map(s => s.trim()) : []
                        }))
                    });
                } else {
                    wx.showToast({
                        title: res.data.msg || '获取医生列表失败',
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
                this.setData({ loading: false });
            }
        });
    },
    viewDoctor(e) {
        const doctorId = e.currentTarget.dataset.id;
        const deptId = this.data.deptId; // 获取科室 ID
        wx.navigateTo({
            url: `/pages/doctorDetail/doctorDetail?id=${doctorId}&deptId=${deptId}` // 传递科室 ID
        });
    },

    goBack() {
        wx.navigateBack();
    },

    // 下拉刷新
    onPullDownRefresh() {
        this.loadDoctors(this.data.deptId);
        wx.stopPullDownRefresh();
    }
});