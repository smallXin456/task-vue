import request from '@/utils/request'

// 查询任务类型列表
export function listType(query) {
  return request({
    url: '/system/type/list',
    method: 'get',
    params: query
  })
}

// 查询任务类型列表
export function listAllType(query) {
  return request({
    url: '/system/type/allList',
    method: 'get',
    params: query
  })
}


// 查询任务类型详细
export function getType(id) {
  return request({
    url: '/system/type/' + id,
    method: 'get'
  })
}

// 新增任务类型
export function addType(data) {
  return request({
    url: '/system/type',
    method: 'post',
    data: data
  })
}

// 修改任务类型
export function updateType(data) {
  return request({
    url: '/system/type',
    method: 'put',
    data: data
  })
}

// 删除任务类型
export function delType(id) {
  return request({
    url: '/system/type/' + id,
    method: 'delete'
  })
}
