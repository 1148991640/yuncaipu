
import DB from '../../utils/DB.js'
import { tables } from '../../utils/config.js'

Page({
  data: {
    files: [],
    recipeTypes: [],//菜谱分类列表
    kf: false
  },
  onLoad() {
    this._getRecipeTypes()
    this.kaifa()
  },
  async kaifa() {
    let id = "1b64dd7b5f901f9101ccaf453d8f8d85"
    let result = await DB._getById(tables.kaifa, id)
    // console.log(result.data.iskaifa)
    wx.setStorageSync('kf', result.data.iskaifa)
    let iskf = wx.getStorageSync('kf')
    this.setData({
      kf: iskf
    })
  },
  //获取菜谱分类的数据
  async _getRecipeTypes() {
    let result = await DB._get(tables.typename, {
      status: '1'
    })
    this.setData({
      recipeTypes: result.data
    })
  },
  //选择图片的函数
  _chooseImageHandle(e) {
    //console.log(e,'选择的结果')
    //处理选择的图片，返回为 [ { url } ]
    let files = e.detail.tempFilePaths.map((item) => {
      return { url: item }
    })
    this.setData({
      files: this.data.files.concat(files)//把原先的图片和新选择的图片连接起来
    })
  },
  //把菜谱集合提交到数据库中。
  async _doPublishRecipe(e) {
    //console.log(e.detail)
    let imgsResult = await this._uploaders(this.data.files)
    //console.log(imgsResult,'接收的上传图片的结果')
    let imgs = imgsResult.map(item => {  //处理数据成  [ 图片地址1,图片地址2,... ]
      return item.fileID
    })
    let data = e.detail.value
    data.imgs = imgs //图片的上传地址
    data.status = '1'//默认是正常的可显示的 2删除的
    data.views = 0//浏览次数
    data.follows = 0 //收藏人数 
    data.addtime = new Date()
    //console.log(data,'我是最终的数据结构')
    let result = await DB._add(tables.recipename, data)
    if (result._id) {
      wx.showToast({
        title: '发布成功',
      })
      //跳转到其它页面
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/personal/personal',
        })
      }, 1500)
    }
  },
  //删除图片，处理data中的files变量
  _deleteFile(e) {
    //console.log(e.detail)
    let index = e.detail.index
    this.data.files.splice(index, 1)
  },
  //上传一组图片
  _uploaders(filepaths) {
    let filepromies = [] //存放每一个文件上传的promise
    filepaths.forEach(item => {
      let filenames = item.url.split('.')
      let t = new Date()
      let newname = '' + t.getTime() + '-' + Math.random().toString().substring(2, 8) + '.' + filenames[filenames.length - 1]
      let ps = wx.cloud.uploadFile({
        cloudPath: newname,//随机的名称
        filePath: item.url,//临时文件的地址
      })
      filepromies.push(ps)
    })
    return Promise.all(filepromies)
  }
})