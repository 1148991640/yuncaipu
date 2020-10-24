
import DB from '../../utils/DB.js'
import { tables, isadminid } from '../../utils/config.js'

Page({
  data: {
    isLogin: false,//是否登录
    userInfo: null,//存储用户信息
    currentUserPubRecipe: [],//当前登录用户发布的菜谱
    activeIndex: '0',//切换按钮的index控制标识
    currentUserFollowRecipes: [],//登录登录用户关注的菜谱信息
    currentUserTypeRecipe: [],
    currentUsercaiRecipe: []
  },
  onLoad() {
    this._checkIsLogin()
    this._getCurrentUserPubRecipe()
  },
  _totype(){
    wx.navigateTo({
      url: '/pages/pbmenutype/pbmenutype',
    })
  },
  //只有管理员才能进入菜谱分类管理页
  _goToRecipeTypePbu() {
    let { _openid } = wx.getStorageSync('loginstatus')
    //console.log( _openid,isadminid )
    //console.log( _openid == isadminid )
    if (_openid == isadminid) {
      wx.navigateTo({
        url: '/pages/pbmenutype/pbmenutype',
      })
    }
  },
  //当前登录用户关注的菜谱
  async _getCurrentUserFollowRecipes() {
    let { _openid } = wx.getStorageSync('loginstatus')
    // console.log(_openid)
    let result = await DB._get(tables.follows, {
      _openid
    })
    // console.log(result,'关注的菜谱信息')
    let recipesPromise = []//处理菜谱的多prommise
    result.data.forEach(item => {
      let pro = DB._getById(tables.recipename, item.recipeid)
      // console.log( pro,'222222' )
      recipesPromise.push(pro)
    })
    let recipeResult = await Promise.all(recipesPromise)

    let currentUserFollowRecipes = recipeResult.map(item => {
      return item.data
    })
    //console.log( currentUserFollowRecipes,'真正的所有的关注菜谱信息' )
    this.setData({
      currentUserFollowRecipes
    })
  },
  //菜谱|分类|关注 切换
  _switchTabs(e) {
    let index = e.currentTarget.dataset.index
    // console.log( index,'aaaa' )

    switch (index) {
      case '0':
        console.log('获取菜谱')
        this._getCurrentUserPubRecipe()
        break;
      case '1':
        console.log('获取分类')
        this._getCurrentUserTypeRecipe()
        break;
      case '2':
        console.log('获取关注')
        this._getCurrentUserFollowRecipes()
        break;

    }

    this.setData({
      activeIndex: index
    })
  },
  //当前登录用户发布的分类
  async _getCurrentUserTypeRecipe() {
    let { _openid } = wx.getStorageSync('loginstatus')
    //console.log(_openid)
    let result = await DB._get(tables.typename, {
      _openid
    })
    console.log(result, '找到的数据')
    this.setData({
      currentUserTypeRecipe: result.data
    })
  },
  //当前登录用户发布的菜谱
  async _getCurrentUserPubRecipe() {
    let { _openid } = wx.getStorageSync('loginstatus')
    //console.log(_openid)
    let result = await DB._get(tables.recipename, {
      _openid
    })
    // console.log( result,'找到的数据' )
    this.setData({
      currentUserPubRecipe: result.data
    })
  },
  //是否登录了
  _checkIsLogin() {
    let loginstatus = wx.getStorageSync('loginstatus')
    if (loginstatus) {
      //已登录，去调用当前用户的菜谱列表信息
      this._getCurrentUserPubRecipe()
      this.setData({
        isLogin: true,
        userInfo: loginstatus.userInfo
      })
    }
  },
  //实现登录功能
  _doLogin(e) {
    let _this = this
    //console.log( e,'用户信息' )
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '请登录以更好体验',
        icon: 'none',
        mask: true
      })
      return
    }
    // return
    //1、获取用户信息
    let userInfo = e.detail.userInfo
    //2、登录逻辑 拿到openid。
    //   /login?
    wx.login({
      async success(res) {
        //成功的拿到_openid
        /*  不能在小程序端调用 code2sessionkey接口。  使用云函数拿到用户的openid
          {
            _openid:
            userInfo
          }
        */
        let openidinfo = await wx.cloud.callFunction({
          name: 'dologin'
        })
        let _openid = openidinfo.result.openid
        //console.log( openidinfo,'调用云函数' )
        //console.log( userInfo,'button的用户信息' )
        /*
          3.
          第一次登录即（注册与登录 add）
          以后登录（如果在用户里面有此_openid的用户，则不进行add）,准确地说可以使用update方法。
        */
        let userResult = await DB._get(tables.users, { _openid })
        //console.log( userResult,'从数据表中查询' )
        let userid = ''//查询或者添加用户信息成功以后的id。
        if (userResult.data.length > 0) {
          userid = userResult.data[0]._id
          console.log('update')
          //按照数据的id更新比较简单
          DB._updateById(tables.users, userid, { userInfo })
        } else {
          console.log('add')
          let result = await DB._add(tables.users, { _openid, userInfo })
          //console.log(result,'add操作')
          userid = result._id
        }
        //登录成功以后，缓存登录的用户信息标识：
        // userInfo、_openid、userid 也存储起来。
        // wx.setStorageSync('userInfo', userInfo)
        // wx.setStorageSync('_openid', _openid)
        // wx.setStorageSync('userid', userid)
        let loginstatus = {
          userInfo, _openid, userid
        }
        wx.setStorageSync('loginstatus', loginstatus)
        //登录成功以后，获取当前用户的菜谱列表信息
        _this._getCurrentUserPubRecipe()
        _this.setData({
          isLogin: true,
          userInfo
        })
      }
    })
  },
  async _seeThisType(e) {
    console.log(e.currentTarget.dataset)
    let { typename, typeid } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/recipelist/recipelist?typename=${typename}&typeid=${typeid}`,
    })
  },
  async delCdlb(e) {
    let id = e.currentTarget.dataset.id
    let newrecipes = await DB._get(tables.recipename, {_id:id})
    let delid = newrecipes.data[0]._id
    let result = await DB._removeById(tables.recipename, delid)
    this._getCurrentUserPubRecipe()
  },
  pbmenu(e) {
    wx.navigateTo({
      url: `/pages/pbmenu/pbmenu`,
    })
  }
})