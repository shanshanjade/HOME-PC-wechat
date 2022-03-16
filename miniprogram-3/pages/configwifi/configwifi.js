Page({
      data: {
        open_time_on: false,
        open_time: '00:00',
        close_time_on: false,
        close_time: '00:00',
        h12: false,
      },
      onLoad(options) {},
      buttontap(){
        console.log('buttontap')
        wx.request({
          url: 'http://192.168.4.1:80',
          method: 'GET',
          // header: {
          //   'content-type': 'multipart/form-data'
          // },
          success: (e)=>{
            console.log(e)
          },
          fail: (e)=>{
            console.log(e)
          }
        })
      },
      bindopentime_picker(e){
        console.log(e)
        this.setData({
          open_time: e.detail.value
        })
      },
      bindclosetime_picker(e){
        console.log(e)
        this.setData({
          close_time: e.detail.value
        })
      },
      bindradio_h12(e){
        console.log('h12:',e.detail.value)
      },

      formSubmit (e) {
        console.log(e)
        var that = this
        wx.request({
            url: 'http://192.168.4.1:80',
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded; boundary=XXX'
            },
            data: {
              'ssid': e.detail.value.ssid,
              'pswd': e.detail.value.pswd
            },
            success: (e)=>{
              console.log(e)
            },
            fail: (e)=>{
              console.log(e)
            }
        })
      }
})
