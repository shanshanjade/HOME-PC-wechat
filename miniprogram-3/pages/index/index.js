const app = getApp();

// pages/index1/index1.js
var realHeight_rpx;
var buttonHeight_rpx;
const Udp = wx.createUDPSocket();
const Udp_port = Udp.bind();

var esp8266_ip;
var esp8266_port;

var timer;
var timer_counts = 0;

var ismDNSrunning = false;
Page({
  data: {
    days: 0,
    hours: 0,
    minutes: 0,
    switch_value:[0,0,0,0,0,0],
    H_value: 0,
    L_value: 50,
    display_flag:0,
    mode_flag:0,
    turnPage_flag:0,
    speed:15,
    display_speed:0,
    color:[],
    isOn:true,
    boot_mode: false,
    timing_on: false ,
    open_time: '',
    close_time: '',
    buttonHeight_rpx:0
  },
  onLoad: function(e){
    wx.getSystemInfo({
      success: (result) => {
        var buttonHeight_rpx = 750 * result.windowHeight / result.windowWidth - 1024 - 20
        this.setData({
          buttonHeight_rpx: parseInt(buttonHeight_rpx)
        })
      },
      
    })
    Udp.onMessage(res=>{
      console.log("got message");
      var JsonString = String.fromCharCode.apply(null,new Uint8Array(res.message));
      var JsonObj = JSON.parse(JsonString)
      var a = parseInt(JsonObj.sys_time)


      this.setData({
        days: Math.floor(a/86400000),
        hours: Math.floor(a%86400000/3600000),
        minutes: Math.floor(a%86400000%3600000/60000),
        timing_on: JsonObj.timing_on,
        open_time: JsonObj.open_time,
        close_time: JsonObj.close_time
      })
    });
    wx.startLocalServiceDiscovery({
      serviceType: '_biubiu._udp.',
      success:res=>{
        console.log(res)
        ismDNSrunning = true;
      },
      fail:res=>{
        console.log(res)
      }
    })
    wx.onLocalServiceDiscoveryStop(res=>{
      ismDNSrunning = false;
      console.log("停止mdns搜索")
    })
    wx.onLocalServiceFound((res) => {
      if (res.serviceName == 'esp8266') {
        esp8266_ip = res.ip;
        esp8266_port = res.port;
        wx.stopLocalServiceDiscovery()
        wx.setNavigationBarTitle({
          title: 'RGB辉光时钟（在线）',
        })
      }
    })
  },
  onShow(){
    console.log('onshow');
    setTimeout(function(){
      Udp.send({
        address: esp8266_ip,
        port: esp8266_port,
        message: `{"get":"time"}`
      })
    }, 500)
  },

  onPullDownRefresh(){
    wx.showNavigationBarLoading(); 
    wx.setNavigationBarTitle({
      title: 'RGB辉光时钟（离线）',
    })
    if (!ismDNSrunning) {
      wx.startLocalServiceDiscovery({
        serviceType: '_biubiu._udp.',
        success:()=>{
          ismDNSrunning = true;
        }
      })
    }
    Udp.send({
      address: esp8266_ip,
      port: esp8266_port,
      message: `{"get":"time"}`
    })
    setTimeout(() => {
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading(); 
    }, 500);
  },
  onSwiper_display_flag_Change: function(e){
    this.setData({
      display_flag: e.detail.current
    })
    this.send_JSON_string("display_flag");
  },
  onHSL_H_changing: function(e){
    this.setData({
      H_value: e.detail.value
    })
  },
  onHSL_H_change: function(e){
    let colorObj = this.HSL2RGB(this.data.H_value, 1, this.data.L_value/100)
    this.setData({
      H_value: e.detail.value,
      color: colorObj.color_RGB_Array
    })
    this.send_JSON_string("color","switch_value");
    wx.setNavigationBarColor({
      backgroundColor: colorObj.color_HEX_String,
      frontColor: '#000000',
      animation: {
        duration: 1500,
        timingFunc: 'easeOut'
      }
    })
  },
  onHSL_L_changing: function(e){
    this.setData({
      L_value: e.detail.value
    })
  },
  onHSL_L_change: function(e){
    let colorObj = this.HSL2RGB(this.data.H_value, 1, this.data.L_value/100)
    this.setData({
      L_value: e.detail.value,
      color: colorObj.color_RGB_Array
    })
    this.send_JSON_string("color","switch_value");
    wx.setNavigationBarColor({
      backgroundColor: colorObj.color_HEX_String,
      frontColor: '#000000',
      animation: {
        duration: 1500,
        timingFunc: 'easeOut'
      }
    })
  },
  onSwitchChange: function(e){
    let swIndex = Number(e.currentTarget.dataset.name.slice(6)) 
    this.setData({
      ['switch_value['+ (swIndex-1) +']']: (e.detail.value==false ? 0 : 1 )
    });
    this.send_JSON_string("switch_value");
  },
  tapRevers: function(){
    this.setData({
      switch_value: this.data.switch_value.map(element=>{ return (!element==false ? 0 : 1); })
    })
    this.send_JSON_string("switch_value");
  },
  tapUnified:function(){
    this.setData({
      switch_value: [0,0,0,0,0,0]
    })
    this.send_JSON_string("switch_value");
  },
  
  onSwiper_mode_flag_Change: function(e){
    this.setData({
      mode_flag: e.detail.current
    })
    this.send_JSON_string("mode_flag");
  },
  onSwiper_turnPage_flag_Change: function(e){
    this.setData({
      turnPage_flag: e.detail.current
    })
    this.send_JSON_string("turnPage_flag");
  },

  tapSpeed: function(){
    var tempSpeed = this.data.speed - 1;
    if (tempSpeed < 0 ) tempSpeed = 15
    this.setData({
      speed: tempSpeed,
      display_speed: 15-tempSpeed
    })
    this.send_JSON_string("speed");
  },

  tapisOn: function(){
    this.setData({
      isOn: !this.data.isOn
    })
    this.send_JSON_string("isOn");
  },
  touchstart_isOn(){
    var that = this
    timer = setInterval(function () {
      timer_counts++
      if(timer_counts > 50){
        timer_counts = 0;
        clearInterval(timer);
        that.setData({
          boot_mode: true
        })
        that.send_JSON_string("boot_mode")
        wx.navigateTo({
          url: "/pages/configwifi2/configwifi2",
        })
      }
    }, 100)
  },
  touchend_isOn(){
    timer_counts = 0;
    clearInterval(timer);
  },
  send_JSON_string: function(bianliangname){
    let tempObj = {};
    tempObj[bianliangname] = this.data[bianliangname];
    console.log(JSON.stringify(tempObj));
    Udp.send({
      address: esp8266_ip,
      port: esp8266_port,
      message: JSON.stringify(tempObj)
    })
  },
  send_JSON_string: function(bianliangname1, bianliangname2){
    let tempObj = {};
    tempObj[bianliangname1] = this.data[bianliangname1];
    tempObj[bianliangname2] = this.data[bianliangname2];
    console.log(JSON.stringify(tempObj));
    Udp.send({
      address: esp8266_ip,
      port: esp8266_port,
      message: JSON.stringify(tempObj)
    })
  },
  HSL2RGB: function(H = 0, S = 0, L = 0){
    const C = (1 - Math.abs(2 * L - 1)) * S
    const X = C * (1 - Math.abs(((H / 60) % 2) - 1))
    const m = L - C / 2
    const vRGB = []
    if (H >= 0 && H < 60) {
      vRGB.push(C, X, 0)
    } else if (H >= 60 && H < 120) {
      vRGB.push(X, C, 0)
    } else if (H >= 120 && H < 180) {
      vRGB.push(0, C, X)
    } else if (H >= 180 && H < 240) {
      vRGB.push(0, X, C)
    } else if (H >= 240 && H < 300) {
      vRGB.push(X, 0, C)
    } else if (H >= 300 && H < 360) {
      vRGB.push(C, 0, X)
    }
    const [vR, vG, vB] = vRGB
    const R = parseInt(255 * (vR + m))
    const G = parseInt(255 * (vG + m))
    const B = parseInt(255 * (vB + m))
    var colorObj = new Object();
    colorObj.color_HEX_String = `#${R > 0xF? R.toString(16) : '0'+R.toString(16)}${G > 0xF? G.toString(16) : '0'+G.toString(16)}${B > 0xF? B.toString(16) : '0'+B.toString(16)}`
    colorObj.color_RGB_Array = [ R, G, B ]
    return  colorObj
  }
})