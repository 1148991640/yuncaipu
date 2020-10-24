
import DB from '../../utils/DB.js'
import { tables } from '../../utils/config.js'

Page({
  data:{
    recipeTypeList:[],//菜谱分类列表
  },
  onLoad(){
    this._getRecipeTypeList()
  },

  //跳转到列表页，接收 typeid和typename参数（列表页需要这两个参数）
  _goToRecipeList(e){
      //console.log(e.currentTarget.dataset)
      let { typename,typeid } = e.currentTarget.dataset
      wx.navigateTo({
        url: `/pages/recipelist/recipelist?typename=${typename}&typeid=${typeid}`,
      })
  },
  //获取菜谱分类列表
  async _getRecipeTypeList(){
      let result = await DB._get( tables.typename,{status:'1'},1,10 )
      //console.log(result)
      this.setData({
        recipeTypeList:result.data
      })
  }
})