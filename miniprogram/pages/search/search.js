Page({
  data:{
    keyword:'',//用户输入的关键字，要传到searchlist页面
    keywords:[],//用户近期搜索的数据
  },
  onShow(){
    this._getKeywords()
  },
  //获取缓存在本地的keywords数据，（存储的用户近期搜索）
  _getKeywords(){
      let keywords = wx.getStorageSync('keywords') || []
      //console.log(keywords,'2222')
      this.setData({
        keywords
      })
  },
  //兼听用户输入关键字，同步到data.keyword变量
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
  }
})