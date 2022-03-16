var userLocationAuthorize = function(){
  wx.authorize({
    scope: 'scope.userLocation',
    success: res => {
      authorize = true
    },
    fail: res => {
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userLocation']) {
            wx.showModal({
              title: '提示',
              content: '小程序未获得地理位置信息授权，点确定授权',
              success(res) {
                if (res.confirm) {
                  wx.openSetting({
                    success: data => {
                      if (data.authSetting["scope.userLocation"] == true) {
                        authorize = true
                      } else if (data.authSetting["scope.userLocation"] == false) {
                        userLocationAuthorize();
                      }
                    }
                  })
                  console.log('用户点击确定')
                } else if (res.cancel) {
                  console.log('用户点击取消')
                  userLocationAuthorize();
                }
              }
            })
          }
        }
      })
    }
  })
}
var connected_wifi;
var authorize = false
App({
  onLaunch: function () {
    wx.startWifi({
      success: (res) => {},
    })
    wx.getConnectedWifi({
      success: (result) => {
        connected_wifi = result.wifi.SSID
      },
    })
  },

  /**
   * 当小程序启动，或从后台进入前台显示，会触发 onShow
   */
  onShow: function (options) {
    userLocationAuthorize()
    setInterval(() => {
      wx.getConnectedWifi({
        success: (result) => {
          if (result.wifi.SSID != connected_wifi) {
            connected_wifi = result.wifi.SSID 
            wx.reLaunch({
              url: '/pages/index/index',
            })
          }
        },
        fail: (res)=>{
          console.log(res.wifi.SSID)
        }
      })
    }, 10000);
  },

  /**
   * 当小程序从前台进入后台，会触发 onHide
   */
  onHide: function () {
    
  },

  /**
   * 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
   */
  onError: function (msg) {
    
  }
})

