Page({
  data: {
    doctors: [],
    showModal: false,
    modalTitle: '添加医生',
    doctorForm: {
      id: '',
      name: '',
      title: '',
      specialty: '',
      department_id: '',
      schedule: '',
      status: 1
    },
    editId: null,
    searchName: '',
    searchResultEmpty: false // 新增
  },
  onLoad() {
    this.loadDoctors();
  },
  loadDoctors(name = '') {
    wx.request({
      url: 'http://127.0.0.1:3000/api/doctors/all' + (name ? `?name=${encodeURIComponent(name)}` : ''),
      method: 'GET',
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ 
            doctors: res.data.data,
            searchResultEmpty: name ? res.data.data.length === 0 : false // 只在查找时判断
          });
        }
      }
    });
  },
  onSearchInput(e) {
    this.setData({ searchName: e.detail.value });
  },
  searchDoctor() {
    this.loadDoctors(this.data.searchName);
  },
  showAddModal() {
    this.setData({
      showModal: true,
      modalTitle: '添加医生',
      doctorForm: { id: '', name: '', title: '', specialty: '', department_id: '', schedule: '', status: 1 },
      editId: null
    });
  },
  showEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const doctor = this.data.doctors.find(d => d.id == id);
    this.setData({
      showModal: true,
      modalTitle: '编辑医生',
      doctorForm: { ...doctor },
      editId: id
    });
  },
  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`doctorForm.${field}`]: e.detail.value });
  },
  closeModal() {
    this.setData({ showModal: false });
  },
  submitDoctor() {
    const { doctorForm, editId } = this.data;
    if (!doctorForm.name || !doctorForm.department_id) {
      wx.showToast({ title: '请填写姓名和科室ID', icon: 'none' });
      return;
    }
    const url = editId ? 'http://127.0.0.1:3000/api/doctors/edit' : 'http://127.0.0.1:3000/api/doctors/add';
    const data = editId ? { ...doctorForm, id: editId } : doctorForm;
    wx.request({
      url,
      method: 'POST',
      data,
      success: () => {
        this.setData({ showModal: false });
        this.loadDoctors();
      }
    });
  },
  deleteDoctor(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该医生吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'http://127.0.0.1:3000/api/doctors/delete',
            method: 'POST',
            data: { id },
            success: () => this.loadDoctors()
          });
        }
      }
    });
  },
  getDoctors: function() {
  var that = this;
  wx.request({
    url: 'http://127.0.0.1:3000/api/doctors',
    data: { department_id: that.data.departmentId },
    success: function(res) {
      if (res.data.code === 0) {
        that.setData({ doctors: res.data.data });
      }
    }
  });
},
setMaxRegistrations: function(e) {
  var that = this;
  var doctorId = e.currentTarget.dataset.id;
  var maxRegistrations = e.detail.value;
  wx.request({
    url: 'http://127.0.0.1:3000/api/doctors/setMaxRegistrations',
    method: 'POST',
    data: { id: doctorId, max_registrations: maxRegistrations },
    success: function(res) {
      if (res.data.code === 0) {
        wx.showToast({ title: '设置成功', icon: 'success' });
      } else {
        wx.showToast({ title: '设置失败', icon: 'none' });
      }
    }
  });
},
  toggleStatus(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status == 1 ? 0 : 1;
    wx.request({
      url: 'http://127.0.0.1:3000/api/doctors/status',
      method: 'POST',
      data: { id, status },
      success: () => this.loadDoctors()
    });
  },
  goBack() {
    wx.navigateBack();
  }
});