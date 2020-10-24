import DB from '../../utils/DB.js'
import {
  tables
} from '../../utils/config.js'

Page({
  data: {
    keyword:'',//用户输入的关键字，要传到searchlist页面
    hotRecipeList: [], //热门菜谱列表，按照浏览量倒序，取8条
  },
  onLoad(){
    this._getHotRecipeList()
  },//兼听用户输入关键字，同步到data.keyword变量
  _keywordHandle(e){
    //console.log( e.detail.value )
    this.data.keyword = e.detail.value
  },
  //按照用户输入的关键字跳转到搜索列表页进行搜索，同时缓存用户输入的关键字
  _goSearchList(){
    if( !this.data.keyword ){
      wx.showToast({
        title: '请留下点什么吧~',
        icon : 'none',
        mask: true
      })
      return
    }

      //设置用户输入菜谱关键字-------------以下是缓存
      //keywords的变量中
      let keyword = this.data.keyword
      let keywords = wx.getStorageSync('keywords') || [] //如果没有缓存设置空数据

      let index = keywords.findIndex(item=>{
          return item === keyword
      })
      if( index !== -1 ){
        keywords.splice( index,1 )
      }

      keywords.unshift(keyword)
      wx.setStorageSync('keywords', keywords)//重新同步缓存


      //-----------------------以上是缓存逻辑

      //return
      wx.navigateTo({
        url: '/pages/searchlist/searchlist?keyword=' + this.data.keyword,
      })
  },
  //跳转到详情页
  _goToRecipeDetail(e){
    let { id,recipename } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipeDetail/recipeDetail?id=${id}&recipename=${recipename}`,
    })
  },
  //跳转到菜谱分类列表页
  _goToRecipeType() {
    wx.navigateTo({
      url: '/pages/typelist/typelist',
    })
  },
  /*
    跳转到菜谱列表页
      typeid
      typename
  */
  _goToRecipeList(e) {
    let {
      typeid,
      typename
    } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?typeid=${typeid}&typename=${typename}`,
    })
  },
  //获取热门菜谱列表
  async _getHotRecipeList() {
    let result = await DB._get(
      tables.recipename, {
        status: '1'
      },
      1,
      8, {
        field: 'views',
        order: 'desc'
      }
    )
    //console.log( result,'热门菜谱' )
    
    //----------------------以下使用Promise.all处理一组数组的异步问题
    let usersPromise = []//存储每一个用户的promise
    result.data.forEach( item=>{
      //result.data 是菜谱列表数据
          //根据每一个数据的_openid来获取用户信息（re-users）
          let _openid = item._openid
          let userPro =  DB._get(
            tables.users,
            { _openid }
          )
          //console.log( userPro,'用户信息' )
          //item.userInfo = userPro.data[0].userInfo
          usersPromise.push( userPro )
    })
    
    let usersInfo = await Promise.all( usersPromise )
    //console.log( usersInfo,'1111' )
    //console.log( result,'22222' )
    result.data.forEach((item,index)=>{
      item.userInfo = usersInfo[index].data[0].userInfo
    })
    //----------------------以上使用Promise.all处理一组数组的异步问题
    this.setData({
      hotRecipeList:result.data
    })
  }
})