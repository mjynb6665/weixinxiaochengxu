Page({
  data: {
    departments: [],
    showModal: false,
    modalTitle: '添加科室',
    deptName: '',
    deptDesc: '',
    editId: null,
    // 新增医生管理相关数据
    showDoctorModal: false,
    currentDeptId: null,
    currentDeptName: '',
    doctors: [],
    showDoctorEditModal: false,
    doctorEditTitle: '添加医生',
    doctorName: '',
    doctorTitle: '',
    doctorSpecialty: '',
    doctorSchedule: '',
    editDoctorId: null
  },

  onLoad() {
    this.loadDepartments();
  },

  // 加载科室列表
  loadDepartments() {
    wx.request({
      url: 'http://127.0.0.1:3000/api/departments',
      success: (res) => {
        if (res.data.code === 0) {
          this.setData({ departments: res.data.data });
        }
      }
    });
  },

  // 显示添加科室弹窗
  showAddModal() {
    this.setData({ 
      showModal: true, 
      modalTitle: '添加科室', 
      deptName: '', 
      deptDesc: '', 
      editId: null 
    });
  },

  // 编辑科室
  editDept(e) {
    const id = e.currentTarget.dataset.id;
    const dept = this.data.departments.find(d => d.id == id);
    this.setData({ 
      showModal: true, 
      modalTitle: '编辑科室', 
      deptName: dept.name, 
      deptDesc: dept.desc, 
      editId: id 
    });
  },

  // 删除科室
  deleteDept(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该科室吗？',
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: 'http://127.0.0.1:3000/api/departments/delete',
            method: 'POST',
            data: { id },
            success: () => this.loadDepartments()
          });
        }
      }
    });
  },

  // 查看科室医生
  viewDoctors(e) {
    const deptId = e.currentTarget.dataset.id;
    const deptName = e.currentTarget.dataset.name;
    
    this.setData({ 
      currentDeptId: deptId, 
      currentDeptName: deptName,
      showDoctorModal: true 
    });
    
    // 获取该科室的医生（包括所有状态的医生）
    wx.request({
      url: 'http://127.0.0.1:3000/api/doctors/all',
      data: { department_id: deptId },
      success: (res) => {
        if (res.data.code === 0) {
          // 过滤出该科室的医生
          const deptDoctors = res.data.data.filter(doctor => 
            doctor.department_id == deptId
          );
          this.setData({ doctors: deptDoctors });
        }
      }
    });
  },

  // 关闭医生管理弹窗
  closeDoctorModal() {
    this.setData({ showDoctorModal: false });
  },

  // 显示添加医生弹窗
  showAddDoctorModal() {
    this.setData({
      showDoctorEditModal: true,
      doctorEditTitle: '添加医生',
      doctorName: '',
      doctorTitle: '',
      doctorSpecialty: '',
      doctorSchedule: '',
      editDoctorId: null
    });
  },

  // 编辑医生
  editDoctor(e) {
    const doctorId = e.currentTarget.dataset.id;
    const doctor = this.data.doctors.find(d => d.id == doctorId);
    this.setData({
      showDoctorEditModal: true,
      doctorEditTitle: '编辑医生',
      doctorName: doctor.name,
      doctorTitle: doctor.title,
      doctorSpecialty: doctor.specialty,
      doctorSchedule: doctor.schedule,
      editDoctorId: doctorId
    });
  },

  // 切换医生状态（上架/下架）
  toggleDoctorStatus(e) {
    const id = e.currentTarget.dataset.id;
    const status = e.currentTarget.dataset.status;
    const newStatus = status === 1 ? 0 : 1;
    
    wx.request({
      url: 'http://127.0.0.1:3000/api/doctors/status',
      method: 'POST',
      data: { id, status: newStatus },
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: '操作成功' });
          // 重新加载医生列表
          this.viewDoctors({ 
            currentTarget: { 
              dataset: { 
                id: this.data.currentDeptId, 
                name: this.data.currentDeptName 
              } 
            }
          });
        } else {
          wx.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
        }
      }
    });
  },

  // 删除医生
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
            success: (res) => {
              if (res.data.code === 0) {
                wx.showToast({ title: '删除成功' });
                // 重新加载医生列表
                this.viewDoctors({ 
                  currentTarget: { 
                    dataset: { 
                      id: this.data.currentDeptId, 
                      name: this.data.currentDeptName 
                    } 
                  }
                });
              } else {
                wx.showToast({ title: res.data.msg || '删除失败', icon: 'none' });
              }
            }
          });
        }
      }
    });
  },

  // 关闭医生编辑弹窗
  closeDoctorEditModal() {
    this.setData({ showDoctorEditModal: false });
  },

  // 提交医生信息
  submitDoctor() {
    const { doctorName, doctorTitle, doctorSpecialty, doctorSchedule, editDoctorId, currentDeptId } = this.data;
    
    if (!doctorName) {
      wx.showToast({ title: '请输入医生姓名', icon: 'none' });
      return;
    }
    
    const url = editDoctorId ? 
      'http://127.0.0.1:3000/api/doctors/edit' : 
      'http://127.0.0.1:3000/api/doctors/add';
    
    const data = {
      name: doctorName,
      title: doctorTitle,
      specialty: doctorSpecialty,
      schedule: doctorSchedule,
      department_id: currentDeptId,
      status: 1
    };
    
    if (editDoctorId) {
      data.id = editDoctorId;
    }
    
    wx.request({
      url,
      method: 'POST',
      data,
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({ title: editDoctorId ? '编辑成功' : '添加成功' });
          this.setData({ showDoctorEditModal: false });
          // 重新加载医生列表
          this.viewDoctors({ 
            currentTarget: { 
              dataset: { 
                id: this.data.currentDeptId, 
                name: this.data.currentDeptName 
              } 
            }
          });
        } else {
          wx.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
        }
      }
    });
  },

  // 科室相关输入处理
  onDeptNameInput(e) {
    this.setData({ deptName: e.detail.value });
  },

  onDeptDescInput(e) {
    this.setData({ deptDesc: e.detail.value });
  },

  // 医生相关输入处理
  onDoctorNameInput(e) {
    this.setData({ doctorName: e.detail.value });
  },

  onDoctorTitleInput(e) {
    this.setData({ doctorTitle: e.detail.value });
  },

  onDoctorSpecialtyInput(e) {
    this.setData({ doctorSpecialty: e.detail.value });
  },

  onDoctorScheduleInput(e) {
    this.setData({ doctorSchedule: e.detail.value });
  },

  // 关闭科室弹窗
  closeModal() {
    this.setData({ showModal: false });
  },

  // 提交科室信息
  submitDept() {
    const { deptName, deptDesc, editId } = this.data;
    if (!deptName) {
      wx.showToast({ title: '请输入科室名称', icon: 'none' });
      return;
    }
    
    const url = editId ? 
      'http://127.0.0.1:3000/api/departments/edit' : 
      'http://127.0.0.1:3000/api/departments/add';
    
    wx.request({
      url,
      method: 'POST',
      data: { id: editId, name: deptName, desc: deptDesc },
      success: () => {
        this.setData({ showModal: false });
        this.loadDepartments();
      }
    });
  },

  // 返回上一页
  goBack() {
    wx.navigateBack();
  }
});
