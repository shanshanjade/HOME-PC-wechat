var timeindex
Page({
  data: {
    E_h12:false,
    timing_on: false,
    open_time: '00:00',
    close_time: '00:00',
    popupshow: false,
    ssid: '',
    pswd: '',
    isAPconnected: false,
    wifilistshow: false,
    wifilist: [],
    set_time_flag: false,
    set_time:{
      year:20,
      month:11,
      day :30,
      hour:18,
      minute:49,
      second:1
    }
  },
 
  onLoad() {
    wx.startWifi({
      success: (res) => {
        wx.getWifiList({
          success: (res) => {
            wx.onGetWifiList((result) => {
              console.log(result)
              let temp = []
              for (let i in result.wifiList) {
                temp.push(result.wifiList[i].SSID)
              }
              this.setData({
                wifilist: temp
              })
            })
          },
          fail: (res)=>{
            console.log(res)
          }
        })
      },
    })
    var that = this
    setInterval(function(){
      
      wx.getConnectedWifi({
        success: (result) => {
          if (result.wifi.SSID == "RGB辉光时钟配网") {
            that.setData({
              isAPconnected: true
            })
          } else {
            that.setData({
              isAPconnected: false
            })
          }
        },
        fail:(res)=>{
          that.setData({
            isAPconnected: false
          })
        }
      })
    },500) 

    
  },
  radio_change(e){
    console.log(this.data.ssid)
    console.log(this.data.pswd)
    this.setData({
      E_h12: e.detail
    })
  },
  switch_calibrate_change(e){
    this.setData({
      set_time_flag: e.detail.value,
    })

  },
  switch_change(e){
    this.setData({
      timing_on: e.detail.value
    })
  },
  show_popup(e){
    timeindex = e.currentTarget.dataset.name;
    this.setData({popupshow: true})
  },
  close_popup(){
    this.setData({popupshow: false})
  },
  time_input(e){
    if (timeindex == "open") {
      this.setData({
        open_time: e.detail
      })
    }else if(timeindex == "close"){
      this.setData({
        close_time: e.detail
      })
    }
  }, 
  show_wifilist(){
    this.setData({
      wifilistshow: true
    })
  },
  close_popupwifilist(){
    this.setData({
      wifilistshow: false
    })
  },
  wifilist_input(e){
    console.log(e);
    this.setData({
      ssid: e.detail.value
    })
  },
  click_saveRestart(){
    var set_time ={}
    var date = new Date()
    set_time.year = date.getFullYear()%100
    set_time. month = date.getMonth() + 1
    set_time. day = date.getDate()
    set_time. hour = date.getHours()
    set_time. minute = date.getMinutes()
    set_time. second = date.getSeconds()
    this.setData({
      set_time: set_time
    })

    wx.request({
      url: 'http://192.168.4.1:80',
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        'E_h12' : this.data.E_h12,
        'timing_on': this.data.timing_on,
        'open_time': this.data.open_time,
        'close_time': this.data.close_time,
        'ssid': this.data.ssid,
        'pswd': this.data.pswd,
        'set_time': JSON.stringify(this.data.set_time),
        'set_time_flag': this.data.set_time_flag
      },
      success: (e)=>{
        console.log(e)
      },
      fail: (e)=>{
        console.log(e)
      }
    })
    wx.navigateTo({
      url: '/pages/index/index',
    })
  },
  connect_AP(){
    var that = this
    wx.connectWifi({
      SSID: 'RGB辉光时钟配网',
      password: '',
      maunal: true

    })
    
  },
})

