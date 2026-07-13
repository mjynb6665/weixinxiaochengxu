// index.js
Page({
  data: {
    hospitalName: '阳光医院',
    hospitalAddress: '',
    hospitalPhone: '',
    departments: [],
    doctors: [
      {
        id: 1,
        name: '王伟明',
        title: '主任医师',
        specialty: '心血管疾病诊治',
        avatar: '/images/doctor-1.jpg'
      }
      // 更多医生数据...
    ],
    notices: [
      {
        id: 1,
        title: '元旦假期门诊安排通知',
        date: '2023-12-25'
      }
      // 更多公告数据...
    ]
  },

  onLoad() {
    // 获取医院设置
    wx.request({
      url: 'http://127.0.0.1:3000/api/settings',
      success: (res) => {
        if (res.data.code === 0 && res.data.data) {
          this.setData({
            hospitalName: res.data.data.hospital_name || '阳光医院',
            hospitalAddress: res.data.data.hospital_address || '',
            hospitalPhone: res.data.data.hospital_phone || ''
          });
        }
      }
    });
    // 请求后端获取科室数据
    wx.request({
      url: 'http://127.0.0.1:3000/api/departments',
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ departments: res.data.data });
        }
      }
    });
  },

  // 搜索输入事件
  onSearch(e) {
    console.log('搜索内容:', e.detail.value)
    // 这里可以添加防抖逻辑
  },

  // 科室选择
  selectDepartment(e) {
    const deptId = e.currentTarget.dataset.id;
    wx.navigateTo({
        url: `/pages/doctorList/doctorList?deptId=${deptId}`
    });
  },

  // 查看医生详情
  viewDoctor(e) {
    const doctorId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/doctorDetail/doctorDetail?id=${doctorId}`
    })
  },

  // 快捷操作跳转
  goTodayRegistration() {
    wx.navigateTo({ url: '/pages/registrations/registrations' })
  },
  goRecords() {
    wx.navigateTo({ url: '/pages/records/list' })
  },
  goReports() {
    wx.navigateTo({ url: '/pages/reports/query' })
  },
  
  // 跳转到预约挂号页面
  goRegistration() {
    wx.navigateTo({ url: '/pages/registrations/registrations' })
  },
  
  // 跳转到登录/注册页面
  goLogin() {
    console.log('跳转到登录/注册页面');
    wx.navigateTo({ url: '/pages/login/login' })
  },

  // 跳转到个人中心页面
  goProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' })
  },

  // 查看公告详情
  viewNotice(e) {
    const noticeId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/notice/detail?id=${noticeId}`
    })
  },

  // 跳转到聊天页面
  goChat() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },

  // 跳转到常见问题页面
  goFaq() {
    wx.navigateTo({ url: '/pages/faq/faq' });
  }
})