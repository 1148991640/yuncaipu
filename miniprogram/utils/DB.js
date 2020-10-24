
let db = wx.cloud.database()

/*
  _add : 数据的添加操作
    params:
          collection:集合表名
          data:添加的数据参数
*/
const _add = ( collection,data = {} )=>{
  //console.log(collection,data)
  return db.collection( collection ).add( { data } ) //返回的是promise
}

/*
   _get: 查询一组
        params:
             collection:集合表名
             where:条件
             skip:跳过几条
             limit:每页限制几条
             orderby：按照哪个字段进行排序，如果没传此参数，则默认按照_id字段进行倒序
*/
const _get = ( collction,where = {},page=1,limit=10,orderby={field:'_id',order:'desc'} )=>{
let skip = (page-1)*limit
 return db.collection(collction).where(where).skip(skip).limit(limit).orderBy(orderby.field,orderby.order).get()
}

/*
_updateById:更新一条数据
  params:
    collection:集合名称
    id:要更新哪个数据的id
    data:要更新的数据
*/

const _updateById = (collection='',id='',data={})=>{
    return db.collection( collection ).doc( id ).update({data})
}

/*
  _getById:根据id查询一条数据。返回一个对象
      params:
          collection:集合名称
          id:查询哪个数据的id
*/
const _getById = (collection,id)=>{
  return db.collection( collection ).doc( id ).get()
}

/*
  _removeById:根据id删除一条数据
    params：
        collection:集合
        id

*/
const _removeById = (collection='',id='')=>{
    return db.collection( collection ).doc(id).remove()
}

export default{
  db,
  _:db.command,
  _add,
  _get,
  _updateById,
  _getById,
  _removeById
}

