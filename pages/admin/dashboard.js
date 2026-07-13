Page({
  data: {
    showPatientDialog: false,
    patientDialogTitle: '',
    patientDialogPlaceholder: '',
    patientDialogType: '',
    patientForm: {
      phone: '',
      password: '',
      name: '',
      id_card: '',
      gender: '',
      birth_date: ''
    },
    editStep: 1, // 1: 查找，2: 修改

    showDoctorDialog: false,
    doctorDialogTitle: '',
    doctorDialogType: '',
    doctorForm: {
      id: '',
      name: '',
      title: '',
      specialty: '',
      department_id: '',
      schedule: '',
      password: ''
    },
    editDoctorStep: 1 // 修改医生时的步骤
  },

  // 病人弹窗
  showPatientModal(e) {
    const type = e.currentTarget.dataset.type;
    let title = '', placeholder = '';
    switch (type) {
      case 'add': title = '增加病人'; placeholder = ''; break;
      case 'delete': title = '删除病人'; placeholder = '请输入病人ID或姓名'; break;
      case 'search': title = '查找病人'; placeholder = '请输入病人ID或姓名'; break;
      case 'edit': title = '修改病人'; placeholder = '请输入要修改的病人姓名'; break;
    }
    this.setData({
      showPatientDialog: true,
      patientDialogTitle: title,
      patientDialogPlaceholder: placeholder,
      patientDialogType: type,
      editStep: type === 'edit' ? 1 : 0, // 进入修改时，先查找
      patientForm: {
        phone: '',
        password: '',
        name: '',
        id_card: '',
        gender: '',
        birth_date: ''
      }
    });
  },

  // 收集病人表单输入
  onPatientFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`patientForm.${field}`]: e.detail.value
    });
  },

  // 修改病人：查找
  searchPatientForEdit() {
    const name = this.data.patientForm.name.trim();
    if (!name) {
      wx.showToast({ title: '请输入要修改的病人姓名', icon: 'none' });
      return;
    }
    wx.request({
      url: 'http://127.0.0.1:3000/api/patient/search',
      method: 'GET',
      data: { keyword: name },
      success: (res) => {
        if (res.data.code === 0 && res.data.data.length > 0) {
          // 只取第一个匹配项
          const patient = res.data.data[0];
          this.setData({
            patientForm: {
              phone: patient.phone,
              password: patient.password,
              name: patient.name,
              id_card: patient.id_card,
              gender: patient.gender,
              birth_date: patient.birth_date
            },
            editStep: 2 // 进入修改
          });
        } else {
          wx.showToast({ title: '未找到该病人', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      }
    });
  },

  // 病人操作
  confirmPatientAction() {
    const type = this.data.patientDialogType;
    const form = this.data.patientForm;
    if (type === 'add') {
      if (!form.phone || !form.password || !form.name) {
        wx.showToast({ title: '请至少输入手机号,密码,姓名', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/patient/add', // 或你的局域网IP
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: {
          phone: form.phone.trim(),
          password: form.password.trim(),
          name: form.name.trim(),
          id_card: form.id_card.trim(),
          gender: form.gender.trim(),
          birth_date: form.birth_date.trim()
        },
        success: (res) => {
          if (res.data.code === 0) {
            wx.showToast({ title: '添加成功', icon: 'success' });
          } else {
            wx.showToast({ title: res.data.msg || '添加失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
      this.setData({
        showPatientDialog: false,
        patientForm: { phone: '', password: '', name: '', id_card: '', gender: '', birth_date: '' }
      });
    } else if (type === 'delete') {
      const keyword = form.name || form.id_card || form.phone || form.id;
      if (!keyword) {
        wx.showToast({ title: '请输入病人ID或姓名', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/patient/delete',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: { keyword },
        success: (res) => {
          if (res.data.code === 0) {
            wx.showToast({ title: '删除成功', icon: 'success' });
          } else {
            wx.showToast({ title: res.data.msg || '删除失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
      this.setData({
        showPatientDialog: false,
        patientForm: { phone: '', password: '', name: '', id_card: '', gender: '', birth_date: '' }
      });
    } else if (type === 'search') {
      // 这里用name或id查找
      const keyword = form.name || form.id_card || form.phone;
      if (!keyword) {
        wx.showToast({ title: '请输入病人ID或姓名', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/patient/search', // 或你的局域网IP
        method: 'GET',
        data: { keyword },
        success: (res) => {
          if (res.data.code === 0) {
            let patients = res.data.data;
            if (!Array.isArray(patients)) {
              patients = [patients];
            }
            let content = '';
            patients.forEach((patient, idx) => {
              content += `【${idx + 1}】\n`;
              content += `id: ${patient.id}\n`;
              content += `phone: ${patient.phone}\n`;
              content += `password: ${patient.password}\n`;
              content += `name: ${patient.name}\n`;
              content += `id_card: ${patient.id_card}\n`;
              content += `gender: ${patient.gender}\n`;
              content += `birth_date: ${patient.birth_date}\n`;
              content += '-------------------\n';
            });
            wx.showModal({
              title: '查找结果',
              content: content,
              showCancel: false
            });
          } else {
            wx.showToast({ title: '未找到', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
      this.setData({ showPatientDialog: false });
    } else if (type === 'edit') {
      if (!form.name) {
        wx.showToast({ title: '请输入要修改的病人姓名', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/patient/edit',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          password: form.password.trim(),
          id_card: form.id_card.trim(),
          gender: form.gender.trim(),
          birth_date: form.birth_date.trim()
        },
        success: (res) => {
          if (res.data.code === 0) {
            wx.showToast({ title: '修改成功', icon: 'success' });
          } else {
            wx.showToast({ title: res.data.msg || '修改失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
      this.setData({
        showPatientDialog: false,
        patientForm: { phone: '', password: '', name: '', id_card: '', gender: '', birth_date: '' },
        editStep: 1
      });
    } else {
      wx.showToast({
        title: `${this.data.patientDialogTitle}：${this.data.patientInput}`,
        icon: 'none'
      });
      this.setData({ showPatientDialog: false });
    }
  },

  // 医生弹窗
  showDoctorModal(e) {
    const type = e.currentTarget.dataset.type;
    let title = '';
    switch (type) {
      case 'add': title = '增加医生'; break;
      case 'delete': title = '删除医生'; break;
      case 'search': title = '查找医生'; break;
      case 'edit': title = '修改医生'; break;
    }
    this.setData({
      showDoctorDialog: true,
      doctorDialogTitle: title,
      doctorDialogType: type,
      editDoctorStep: type === 'edit' ? 1 : 0,
      doctorForm: {
        id: '',
        name: '',
        title: '',
        specialty: '',
        department_id: '',
        schedule: '',
        password: ''
      }
    });
  },

  // 医生表单输入
  onDoctorFormInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`doctorForm.${field}`]: e.detail.value
    });
  },

  // 医生操作
  confirmDoctorAction() {
    const type = this.data.doctorDialogType;
    const form = this.data.doctorForm;
    if (type === 'add') {
      if (!form.name || !form.department_id) {
        wx.showToast({ title: '请填写姓名和科室ID', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/doctor/add',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: form,
        success: (res) => {
          if (res.data.code === 0) {
            wx.showToast({ title: '添加成功', icon: 'success' });
          } else {
            wx.showToast({ title: res.data.msg || '添加失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    } else if (type === 'delete') {
      if (!form.id && !form.name) {
        wx.showToast({ title: '请输入医生ID或姓名', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/doctor/delete',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: { keyword: form.id || form.name },
        success: (res) => {
          if (res.data.code === 0) {
            wx.showToast({ title: '删除成功', icon: 'success' });
          } else {
            wx.showToast({ title: res.data.msg || '删除失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    } else if (type === 'search') {
      if (!form.id && !form.name) {
        wx.showToast({ title: '请输入医生ID或姓名', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/doctor/search',
        method: 'GET',
        data: { keyword: form.id || form.name },
        success: (res) => {
          if (res.data.code === 0) {
            let doctors = res.data.data;
            if (!Array.isArray(doctors)) doctors = [doctors];
            let content = '';
            doctors.forEach((doctor, idx) => {
              content += `【${idx + 1}】\n`;
              content += `id: ${doctor.id}\n`;
              content += `name: ${doctor.name}\n`;
              content += `title: ${doctor.title}\n`;
              content += `specialty: ${doctor.specialty}\n`;
              content += `department_id: ${doctor.department_id}\n`;
              content += `schedule: ${doctor.schedule}\n`;
              content += '-------------------\n';
            });
            wx.showModal({
              title: '查找结果',
              content: content,
              showCancel: false
            });
          } else {
            wx.showToast({ title: '未找到', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    } else if (type === 'edit') {
      if (!form.id) {
        wx.showToast({ title: '请输入要修改的医生ID', icon: 'none' });
        return;
      }
      wx.request({
        url: 'http://127.0.0.1:3000/api/doctor/edit',
        method: 'POST',
        header: { 'content-type': 'application/json' },
        data: form,
        success: (res) => {
          if (res.data.code === 0) {
            wx.showToast({ title: '修改成功', icon: 'success' });
          } else {
            wx.showToast({ title: res.data.msg || '修改失败', icon: 'none' });
          }
        },
        fail: () => {
          wx.showToast({ title: '网络错误', icon: 'none' });
        }
      });
    }
    this.setData({ showDoctorDialog: false });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({
      showPatientDialog: false,
      showDoctorDialog: false,
      editStep: 1
    });
  },
  stopPropagation() {},

  // 退出登录
  logout() {
    wx.removeStorageSync('userInfo');
    wx.redirectTo({
      url: '/pages/login/login'
    });
  },

  // 跳转到科室管理
  goDeptManage() {
    wx.navigateTo({ url: '/pages/admin/departments/departments' });
  },

  // 跳转到医生管理
  goDoctorManage() {
    wx.navigateTo({ url: '/pages/admin/doctors/doctors' });
  },

  // 跳转到挂号管理
  goRegistrationManage() {
    wx.navigateTo({
      url: '/pages/admin/registrations/registrations'
    });
  },

  // 跳转到数据分析
  goAnalysis() {
    wx.navigateTo({
      url: '/pages/admin/analysis/analysis'
    });
  },

  // 跳转到设置
  goSettings() {
    wx.navigateTo({
      url: '/pages/admin/settings/settings'
    });
  }
});