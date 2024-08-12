import request from '@/utils/request'

// 查询任务状态列表
export function listStatus(query) {
  return request({
    url: '/system/status/list',
    method: 'get',
    params: query
  })
}

// 查询所有任务状态列表，根据状态
export function allListByType(query) {
  return request({
    url: '/system/status/allListByType',
    method: 'get',
    params: query
  })
}

// 查询任务状态详细
export function getStatus(id) {
  return request({
    url: '/system/status/' + id,
    method: 'get'
  })
}

// 新增任务状态
export function addStatus(data) {
  return request({
    url: '/system/status',
    method: 'post',
    data: data
  })
}

// 修改任务状态
export function updateStatus(data) {
  return request({
    url: '/system/status',
    method: 'put',
    data: data
  })
}

// 删除任务状态
export function delStatus(id) {
  return request({
    url: '/system/status/' + id,
    method: 'delete'
  })
}
