let db = wx.cloud.database()

import DB from '../../utils/DB.js'
import {
  tables
} from '../../utils/config.js'

Page({
  data: {
    typename: '', //修改分类的名称
    typename1: '', //添加分类的名称
    recipeTypes: [], //菜谱分类列表
    id: '', //根据此id修改菜谱分类
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
  //删除菜谱分类，根据id
   _doRecipeTypeById(e) {
    let id = e.currentTarget.dataset.id
    let _this = this
    wx.showModal({
      title: '云菜谱温馨提示',
      content: '您确定要离开我吗~',
      async success(res) {
        if (res.confirm) {
          let result = await db
            .collection(tables.typename)
            .doc(id)
            .remove()
          //console.log(result, '删除的结果')
          if (result.stats.removed > 0) {
            wx.showToast({
              title: '删除成功',
            })
            _this._getRecipeTypes() //同步一下数据
          }
        }
      }
    })


  },
  //点击修改文字按钮显示 修改input框，同时为data中的id 赋值
  _editHandle(e) {
    //console.log(e.currentTarget.dataset)
    let {
      id,
      typename
    } = e.currentTarget.dataset
    //this.data.id = 
    this.setData({
      id,
      typename
    })
  },
  //修改菜谱的名称
  async _doUpdateRecipeTypename() {
    /*
      根据id修改数据 ： 8f29e52a5f87ed4a0015baeb631d2d1e
    */
    //console.log( this.data )
    let {
      id,
      typename
    } = this.data
    let result = await DB._updateById(tables.typename, id, {
      typename
    })
    //console.log(result,'修改结果')
    if (result.stats.updated > 0) {
      wx.showToast({
        title: '修改成功',
      })
      this._getRecipeTypes() //同步一下修改的数据
    }
    return
    // let result = await db
    //           .collection(tables.typename)
    //           .doc( '8f29e52a5f87ed4a0015baeb631d2d1e' )
    //           .update({
    //             data:{
    //               typename:'午餐'
    //             }
    //           })
    //         console.log(result,'修改的结果')
  },
  //获取菜谱分类的数据
  async _getRecipeTypes() {
    // let result = await db
    //       .collection(tables.typename)
    //       .where({status:'1'})
    //       .get()
    let result = await DB._get(tables.typename, {
      status: '1'
    })
    //console.log(result,'数据123')
    this.setData({
      recipeTypes: result.data
    })
  },
  //兼听菜谱分类名称的修改
  _typenameHandle(e) {
    //console.log(e.detail,'1234')
    this.data.typename = e.detail.value
  },
  //添加菜谱的分类 
  async _doPublishRecipeType() {
    //console.log( this.data )
    //return
    let typename = this.data.typename
    let result = await DB._add(tables.typename, {
      typename,
      status: '1'
    })
    //console.log(result,'添加结果')
    if (result._id) {
      wx.showToast({
        title: '添加成功',
        mask: true
      })
      this._getRecipeTypes() //同步一下数据
      this.setData({
        typename: ''
      })
    }
  }
})