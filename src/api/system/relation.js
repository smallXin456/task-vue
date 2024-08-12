import request from '@/utils/request'

// 查询任务关系列表
export function listRelation(query) {
  return request({
    url: '/system/relation/list',
    method: 'get',
    params: query
  })
}

// 查询任务关系详细
export function getRelation(id) {
  return request({
    url: '/system/relation/' + id,
    method: 'get'
  })
}

// 新增任务关系
export function addRelation(data) {
  return request({
    url: '/system/relation',
    method: 'post',
    data: data
  })
}

// 修改任务关系
export function updateRelation(data) {
  return request({
    url: '/system/relation',
    method: 'put',
    data: data
  })
}

// 删除任务关系
export function delRelation(id) {
  return request({
    url: '/system/relation/' + id,
    method: 'delete'
  })
}
