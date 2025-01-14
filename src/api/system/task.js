import request from '@/utils/request'

// 查询任务列表
export function listTask(query) {
  return request({
    url: '/system/task/list',
    method: 'get',
    params: query
  })
}

// 查询主任务列表
export function masterTaskList(query) {
  return request({
    url: '/system/task/masterTaskList',
    method: 'get',
    params: query
  })
}

// 查询任务详细
export function getTask(id) {
  return request({
    url: '/system/task/' + id,
    method: 'get'
  })
}

// 新增任务
export function addTask(data) {
  return request({
    url: '/system/task',
    method: 'post',
    data: data
  })
}

// 修改任务
export function updateTask(data) {
  return request({
    url: '/system/task',
    method: 'put',
    data: data
  })
}

// 修改关联任务
export function editContactTask(data) {
  return request({
    url: '/system/task/editContactTask',
    method: 'put',
    data: data
  })
}



// 重新获取ip
export function againGetIpFuntion(data) {
  return request({
    url: '/system/task/againGetIp',
    method: 'put',
    data: data
  })
}

// 关联任务
export function bindMasterTask(data) {
  return request({
    url: '/system/task/bindMasterTask',
    method: 'put',
    data: data
  })
}

// 删除任务
export function delTask(id) {
  return request({
    url: '/system/task/' + id,
    method: 'delete'
  })
}
