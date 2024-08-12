import request from '@/utils/request'

// 查询提交单位列表
export function listSource(query) {
  return request({
    url: '/system/source/list',
    method: 'get',
    params: query
  })
}

// 查询所有提交单位列表
export function listAllSource(query) {
  return request({
    url: '/system/source/alllist',
    method: 'get',
    params: query
  })
}

// 查询提交单位详细
export function getSource(id) {
  return request({
    url: '/system/source/' + id,
    method: 'get'
  })
}

// 新增提交单位
export function addSource(data) {
  return request({
    url: '/system/source',
    method: 'post',
    data: data
  })
}

// 修改提交单位
export function updateSource(data) {
  return request({
    url: '/system/source',
    method: 'put',
    data: data
  })
}

// 删除提交单位
export function delSource(id) {
  return request({
    url: '/system/source/' + id,
    method: 'delete'
  })
}
