import DB from '../../utils/DB.js'
import {
  tables
} from '../../utils/config.js'

/*
  跳转到详情页需要的参数：
    id：当前菜谱的id
    recipename：菜谱名称
*/
Page({
  data: {
    id: '',//当前菜谱的id
    recipename: '', //菜谱名称
    recipeDetail:null,//菜谱的详情
    isFollow:false,//假设当前用户没有关注为false 关注则为true
    followId:'',//当用户关注了此菜谱，那么把这条记录的id保存在此变量中，后续要根据 此变量删除关注的数据
    _openid:'',//后续完成登录功能，就可以把用户的openid标识存储在缓存中。
    userInfo:null,//存储此菜谱是哪个用户发布的
  },
  onShareAppMessage(){
    // return {
    //   imageUrl:'https://t8.baidu.com/it/u=3571592872,3353494284&fm=79&app=86&size=h300&n=0&g=4n&f=jpeg?sec=1603592537&t=d4292838780fc3412fc5e28fe6476cda',
    //   title:'xxxxx的做法'
    // }
  },
  onLoad(options) {
    console.log( options )
    wx.setNavigationBarTitle({
      title:options.recipename
    })
    this.data.id = options.id
    //return
    this._getRecipeById()
    this._currentUserFollowRecipe()
    this._setViewsNumber()
  },
  //浏览量自增1
  async _setViewsNumber(){
      let id = this.data.id
     let result = await DB._updateById( 
        tables.recipename,
        id,{
          views:DB._.inc(1)
        } )
      //console.log( result,'views更新了' )
  },
  //根据用户_openid获取用户详细信息（ 头像和昵称 ）
  async _getUserInfoByOpenid( _openid ){
    //console.log( _openid,'111222' )
    let result = await DB._get(
      tables.users,
      { _openid }
    )
    //console.log( result,'我是一个' )
    this.setData({
      userInfo:result.data[0].userInfo
    })
  },
  //设置当前菜谱的关注与取消
  async _setFollow(){
    // 如果没有登录则提示用户登录，跳转到登录页
    let { _openid } = wx.getStorageSync('loginstatus')
    this.data._openid = _openid
    if( !_openid ){
      wx.showToast({
        title: '请登录再关注~',
        icon: 'none',
        mask: true,
      })
      setTimeout(()=>{
          wx.switchTab({
            url: '/pages/personal/personal',
          })
      },1500)
      return
    }
     let id = this.data.id
      if( this.data.isFollow ){
        //console.log('要取消')
        /*
          根据followid删除关注表的数据（ 用户和菜谱的关注关系。 ）
        */
       let newfollows =  await DB._get(tables.follows,{recipeid:id})
       let followid = newfollows.data[0]._id
      //  console.log(followid)
       //删除的是 re-follows表
       let result = await DB._removeById(
        tables.follows,
        followid
       )
      //  console.log(result)
       //修改follows字段（re-recipes表 ）
        let result1 = await DB._updateById( 
        tables.recipename,
        id,{
          follows:DB._.inc(-1)
        } )
       // console.log( result1,'删除的状态' )
        this.setData({
          isFollow:false
        })
      }else{
        //console.log('要关注')
        //console.log( this.data._openid,this.data.id )
        let  _openid = this.data._openid
        let  recipeid = this.data.id
        //往 re-follows表增加数据
       let result = await DB._add( tables.follows,{ _openid,recipeid} )
       //console.log( result,'添加的结果' )
       //修改follows字段（re-recipes表 ）
       let result1 = await DB._updateById( 
        tables.recipename,
        id,{
          follows:DB._.inc(1)
        } )
        this.setData({
          isFollow:true
        })
      }
  },
  //当前登录用户是否关注了此菜谱
  async _currentUserFollowRecipe(){
      let loginstatus = wx.getStorageSync('loginstatus')//后续完成登录功能，就可以把用户的openid标识存储在缓存中。
      let _openid = loginstatus._openid
      let recipeid = this.data.id //菜谱id。因为关注表中存储的菜谱id的字段名为 recipeid
      /*
        去re-follows表中查询 openid和当前详情的id的条件同时满足
      */
     let result = await DB._get(
       tables.follows,
       { _openid,recipeid }
     )
     //console.log( result,'关注的信息' )
     
     if( result.data.length > 0 ){//找到数据了，设置为true

        this.setData({
          isFollow:true,
          followId:result.data[0]._id
        })
     }
  },
  //根据id获取菜谱的详情
  async _getRecipeById() {
    let id = this.data.id
    let result = await DB._getById(tables.recipename, id)
    //console.log(result, '数据')
    this._getUserInfoByOpenid( result.data._openid )//获取用户信息的方法
    this.setData({
      recipeDetail:result.data
    })
  }
})