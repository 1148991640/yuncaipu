import DB from '../../utils/DB.js'
import { tables } from '../../utils/config.js'
/*
  列表页访问必传参数：
    typeid:按类别id查询菜谱
    typename:动态设置标题栏上的文字
*/
Page({
  data:{
      recipeList:[],//菜谱列表
      page:1,//默认第1页
      size:3,//每页展示的条数
      isMore:false,//默认有下一页的数据
      typeid:'',
      
  },
  onLoad(options){
    // console.log(options,'我是参数,我是列表页')
    wx.setNavigationBarTitle({
      title:options.typename
    })
    this.data.typeid = options.typeid
    this._getRecipeList()
  },
  /*
    获取菜谱列表：
      必不可少的条件 status:'1'
      按哪个类别查找：typeid
      其它条件：
            page:1
            size:3
        分页原理：
              1 ：  0，3     （ page-1 ）*size
              2：   3，3
              3：   6，3
  */
  async _getRecipeList(){
    //没有更多，则return，不会再去发送http请求
    if( this.data.isMore ){
      return
    }
    wx.showLoading({
      title: '玩命加载中~',
    })
     let typeid = this.data.typeid //肯定是由其它页面跳转过来传递的参数
     let size = this.data.size
     let page = this.data.page
     /*
             collection:集合表名
             where:条件
             page:当前页码
             limit:每页限制几条
             orderby：按照哪个字段进行排序，如果没传此参数，则默认按照_id字段进行倒序

             axios({
               url:'/recipes',
               data:{
                 status,typeid,page,size,orderby
               }
             })
     */
     let result = await DB._get( 
                tables.recipename,
                { status:'1',typeid } ,
                page,
                size,
                { field:'addtime',order:'desc' }
                )
    //  console.log(result,'菜谱列表')
     if( result.data.length == 0 || result.data.length < this.data.size){
       this.setData({
        isMore:true
       })
     }
     wx.hideLoading()
     this.setData({ //获取的新数据连接到原数组对象中
      recipeList:this.data.recipeList.concat(result.data)
     })
  },
  //滚动到底部时触发
  onReachBottom(){
    //console.log('到底部了，要下一页')
    this.data.page++
    this._getRecipeList()
  },
  _todetail(e){
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?id=${e.currentTarget.dataset.id}&recipename=${e.currentTarget.dataset.recipename}`,
    })
  }
})