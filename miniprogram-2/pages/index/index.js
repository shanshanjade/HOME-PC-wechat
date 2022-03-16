Page({

  /**
   * 页面的初始数据
   */
  data: {
    checked: true,
    disabled: false,
    buttonText: "禁用"
  },
  onChange: function({detail}){
    if (detail) {
      wx.showToast({
        title: '打开了开关',
      })
    }else{
      wx.showToast({
        title: '关闭了开关',
      })
    }
    this.setData({
      checked: detail
    })
  },
  disabledSwitch:function(){

    this.setData({
      disabled: !this.data.disabled
    })

    if(this.data.disabled == true){
      this.setData({
        buttonText: "启用"
      })
    }else{
      this.setData({
        buttonText: "禁用"
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  }
})