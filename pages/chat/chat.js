Page({
  data: {
    messages: [
      { id: 1, from: 'doctor', type: 'text', content: '您好，有什么可以帮您？' }
    ],
    inputValue: ''
  },
  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },
  sendText() {
    if (!this.data.inputValue.trim()) return;
    const newMsg = {
      id: Date.now(),
      from: 'patient',
      type: 'text',
      content: this.data.inputValue
    };
    this.setData({
      messages: [...this.data.messages, newMsg],
      inputValue: ''
    });
    // 模拟医生自动回复
    setTimeout(() => {
      this.setData({
        messages: [...this.data.messages, {
          id: Date.now() + 1,
          from: 'doctor',
          type: 'text',
          content: '医生已收到您的消息。'
        }]
      });
    }, 1000);
  },
  chooseImage() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        const imgPath = res.tempFilePaths[0];
        const newMsg = {
          id: Date.now(),
          from: 'patient',
          type: 'image',
          content: imgPath
        };
        this.setData({
          messages: [...this.data.messages, newMsg]
        });
        // 模拟医生收到图片
        setTimeout(() => {
          this.setData({
            messages: [...this.data.messages, {
              id: Date.now() + 1,
              from: 'doctor',
              type: 'text',
              content: '医生已收到您的图片。'
            }]
          });
        }, 1000);
      }
    });
  },
  goBack() {
    wx.navigateBack();
  }
});