<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">

      <el-form-item label="任务编号" prop="id">
        <el-input
            v-model="queryParams.id"
            placeholder="请输入任务编号"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>


      <el-form-item label="打击进程" prop="penetrationStatus">
        <el-select
            v-model="queryParams.penetrationStatus"
            placeholder="请选择任务打击进程"
            clearable
            style="width: 240px">
          <el-option
              v-for="dict in sys_hit_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>

      <el-form-item label="研判进程" prop="analysisStatus">
        <el-select
            v-model="queryParams.analysisStatus"
            placeholder="请选择任务研判进程"
            clearable
            style="width: 240px">
          <el-option
              v-for="dict in sys_hit_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"/>
        </el-select>
      </el-form-item>

      <el-form-item label="地区" prop="type">
        <el-cascader
            placeholder="请输入/选择地区"
            v-model="queryParams.area"
            :options="options"
            @change="handleChange"
            filterable
            clearable>
        </el-cascader>
      </el-form-item>


      <el-form-item label="创建时间" style="width: 308px;">
        <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
        </el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        <el-button
            type="primary"
            plain
            icon="Search"
            @click="handleTaskSearch"
            v-hasPermi="['system:task:list']">查询任务
        </el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:task:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:task:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:task:remove']"
        >删除</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="info"
            plain
            icon="Upload"
            @click="handleImport"
        >导入</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:task:export']"
        >导出</el-button>
      </el-col>


      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Plus"
            @click="subTask"
            :disabled="addTaskButton"
            v-hasPermi="['system:task:addSubTask']"
        >关联</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            @click="deleteSubTask"
            :disabled="deleteTaskButton"
            v-hasPermi="['system:task:deleteSubTask']"
        >取消关联</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Plus"
            @click="againGetIp('signle')"
            :disabled="againGetIpButton"
        >ip重新获取</el-button>
      </el-col>

      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Plus"
            @click="againGetIp('all')"
        >所有任务ip重新获取</el-button>
      </el-col>


      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="taskList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="任务编号" align="center" prop="id" fixed width="180px">
        <template #default="scope">

          <span>
            <el-tag type="success" v-if="scope.row.parentTaskRadio==0">主任务</el-tag>
            <el-tag type="danger"  v-else-if="scope.row.parentTaskRadio==-1 && scope.row.parentTaskId==-1">子任务-未关联</el-tag>
            <el-tag  v-else-if="scope.row.parentTaskRadio==-1 && scope.row.parentTaskId!=-1">子任务-已关联</el-tag>

            {{scope.row.id}}
          </span>

        </template>
      </el-table-column>
      <el-table-column label="URL地址" align="center" prop="url" width="170px" fixed />

      <el-table-column label="打击进程" align="center" prop="penetrationStatus">
        <template #default="scope">
          <dict-tag :options="sys_hit_status" :value="scope.row.penetrationStatus" />
        </template>
      </el-table-column>

      <el-table-column label="打击跟进人" align="center" prop="penetrationFollowPerson" />

      <el-table-column label="打击状态" align="center" prop="penetrationStatusResult" width="150px">
        <template #default="scope">
          <el-tag >{{ getStatusName(scope.row.penetrationStatusResult) }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="打击完成时间" align="center" prop="penetrationEndTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.penetrationEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>

      <el-table-column label="研判进程" align="center" prop="analysisStatus" >
        <template #default="scope">
          <dict-tag :options="sys_hit_status" :value="scope.row.analysisStatus"/>
        </template>
      </el-table-column>

      <el-table-column label="研判跟进人" align="center" prop="analysisFollowPerson" />

      <el-table-column label="研判状态" align="center" prop="analysisStatus">
        <template #default="scope">
          <el-tag v-if="scope.row.analysisStatus == 2">{{ "-----" }}</el-tag>
          <el-tag type="danger" v-else-if="scope.row.analysisStatus == 0">{{ "未完成" }}</el-tag>
          <el-tag type="success" v-else-if="scope.row.analysisStatus == 1">{{ "已完成" }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="研判完成时间" align="center" prop="analysisEndTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.analysisEndTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>


      <el-table-column label="省份" align="center" prop="province" />
      <el-table-column label="城市" align="center" prop="city" />
      <el-table-column label="区县" align="center" prop="county" />

      <el-table-column label="案件类型" align="center" width="120px" prop="type" >
        <template #default="scope">
          <el-tag >{{ getName(scope.row.type) }}</el-tag>
          <!--          {{ getName(scope.row.type) }}-->
        </template>
      </el-table-column>

      <el-table-column label="IP地址" align="center" prop="ip" width="120px"/>
      <el-table-column label="任务创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="任务创建人" align="center" prop="createBy" />



      <el-table-column label="加急状态" align="center" prop="priority" fixed="right">
        <template #default="scope">
          <dict-tag :options="sys_priority" :value="scope.row.priority" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200px" fixed="right">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleSearch(scope.row)" v-hasPermi="['system:task:edit']">查看</el-button>
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:task:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:task:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 关联任务对话框 -->
    <el-dialog :title="title" v-model="addSubTask" width="650px" append-to-body>

      <el-form-item label="请选择主任务编号" prop="source">
        <el-select v-model="subTaskForm.parentTaskId" placeholder="请选择"
                   filterable
                   clearable>
          <el-option
              v-for="dict in masterTaskListValue"
              :key="dict.id"
              :label="dict.id"
              :value="dict.id">
          </el-option>
        </el-select>
      </el-form-item>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitSubTask">确 定</el-button>
          <el-button @click="subTaskCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加或修改任务对话框 -->
    <el-dialog :title="title" v-model="open" width="650px" append-to-body>

      <el-form v-if="title=='添加任务'" ref="taskRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="提交单位" prop="source">
          <el-select v-model="form.source" placeholder="请选择提交单位"
                     filterable
                     clearable>
            <el-option
                v-for="dict in sourceList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="加急状态" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择加急状态">
            <el-option
                v-for="dict in sys_priority"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="地区" prop="value">
          <el-cascader
              placeholder="请输入/选择地区"
              v-model="form.area"
              :options="options"
              @change="handleChange"
              filterable
              clearable
              style="width: 530px">
          </el-cascader>
        </el-form-item>

        <el-form-item label="案件类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择案件类型"
                     filterable
                     clearable>
            <el-option
                v-for="dict in typeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="提交方内部编号" prop="clientCode">
          <el-input v-model="form.clientCode" placeholder="请输入提交方内部编号" />
        </el-form-item>

        <el-form-item label="URL网址" prop="url">
          <el-input v-model="form.url" placeholder="请输入URL网址" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>
      </el-form>


      <el-form v-if="title=='修改任务'" ref="taskRef" :model="form" :rules="rules" label-width="120px">

        <el-form-item label="加急状态" prop="priority">
          <el-select v-model="form.priority" placeholder="请选择加急状态">
            <el-option
                v-for="dict in sys_priority"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="地区" prop="value">
          <el-cascader
              placeholder="请输入/选择地区"
              v-model="form.area"
              :options="options"
              @change="handleChange"
              filterable
              clearable
              style="width: 530px">
          </el-cascader>
        </el-form-item>

        <el-form-item label="案件类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择案件类型"
                     filterable
                     clearable>
            <el-option
                v-for="dict in typeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="提交方内部编号" prop="clientCode">
          <el-input v-model="form.clientCode" placeholder="请输入提交方内部编号" />
        </el-form-item>


        <el-form-item label="URL网址" prop="url">
          <el-input v-model="form.url" placeholder="请输入URL网址" />
        </el-form-item>

        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>

        <el-form-item label="打击状态" align="center" prop="penetrationStatusResult" width="140px">
          <el-select v-model="form.penetrationStatusResult" filterable clearable placeholder="请选择打击状态">
            <el-option
                v-for="item in statusList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="打击跟进人" prop="penetrationFollowPerson">
          <el-select v-model="form.penetrationFollowPerson"
                     filterable clearable placeholder="请选择打击跟进人">
            <el-option
                v-for="item in penetrationFollowPersonList"
                :key="item.nickName"
                :label="item.nickName"
                :value="item.nickName">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="研判跟进人" prop="analysisFollowPerson">
          <el-select v-model="form.analysisFollowPerson"
                     filterable clearable placeholder="请选择研判跟进人">
            <el-option
                v-for="item in analysisFollowPersonList"
                :key="item.nickName"
                :label="item.nickName"
                :value="item.nickName">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="研判状态" prop="analysisStatus">
          <el-select  v-model="form.analysisStatus" filterable clearable placeholder="请选择">
            <el-option
                v-for="item in analysisStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="账号" prop="account">
          <el-input
              v-model="queryParams.account"
              placeholder="请输入账号"
              clearable
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="queryParams.password"
              placeholder="请输入密码"
              clearable/>
        </el-form-item>

        <el-form-item label="管理员备注" prop="employerRemark">
          <el-input
              v-model="form.employerRemark"
              placeholder="请输入备注"
              clearable/>
        </el-form-item>

        <el-form-item label="是否是主任务" prop="parentTaskRadio">
          <el-radio-group v-model="form.parentTaskRadio">
            <el-radio
                v-for="dict in isMasterTask"
                :key="dict.value"
                :value="dict.value"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- searchOpen任务对话框 -->
    <el-dialog :title="title" v-model="searchOpen" width="650px" append-to-body>
      <el-form ref="taskRef" :model="queryParams"  label-width="120px">
        <el-form-item label="提交单位" prop="source">
          <el-select v-model="queryParams.source" placeholder="请选择提交单位"
                     filterable
                     clearable>
            <el-option
                v-for="dict in sourceList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>

        </el-form-item>

        <el-form-item label="加急状态" prop="priority">
          <el-select v-model="queryParams.priority" placeholder="请选择加急状态">
            <el-option
                v-for="dict in sys_priority"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="地区" prop="value">
          <el-cascader
              placeholder="请输入/选择地区"
              v-model="queryParams.area"
              :options="options"
              @change="handleChange"
              filterable
              clearable
              style="width: 530px">
          </el-cascader>
        </el-form-item>

        <el-form-item label="案件类型" prop="type">
          <el-select v-model="queryParams.type" placeholder="请选择案件类型"
                     filterable
                     clearable>
            <el-option
                v-for="dict in typeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="提交方内部编号" prop="clientCode">
          <el-input v-model="queryParams.clientCode" placeholder="请输入提交方内部编号" />
        </el-form-item>


        <el-form-item label="URL网址" prop="url">
          <el-input v-model="queryParams.url" placeholder="请输入URL网址" />
        </el-form-item>

        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="queryParams.ip" placeholder="请输入IP地址" />
        </el-form-item>


        <el-form-item label="任务创建时间" prop="createTime">
          <el-date-picker clearable
                          v-model="queryParams.createTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择任务创建时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="打击跟进人" prop="penetrationFollowPerson">
          <el-select v-model="queryParams.penetrationFollowPerson"
                     filterable clearable placeholder="请选择打击跟进人">
            <el-option
                v-for="item in penetrationFollowPersonList"
                :key="item.nickName"
                :label="item.nickName"
                :value="item.nickName">
            </el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="打击状态" align="center" prop="penetrationStatusResult" width="140px">
          <el-select v-model="queryParams.penetrationStatusResult" filterable clearable placeholder="请选择打击状态">
            <el-option
                v-for="item in statusList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="打击完成时间" prop="penetrationEndTime">
          <el-date-picker clearable
                          v-model="queryParams.penetrationEndTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择渗透完成时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="研判跟进人" prop="analysisFollowPerson">
          <el-select v-model="queryParams.analysisFollowPerson"
                     filterable clearable placeholder="请选择研判跟进人">
            <el-option
                v-for="item in analysisFollowPersonList"
                :key="item.nickName"
                :label="item.nickName"
                :value="item.nickName">
            </el-option>
          </el-select>

        </el-form-item>

        <el-form-item label="研判状态" prop="analysisStatus">
          <el-select v-model="queryParams.analysisStatus" filterable clearable placeholder="请选择">
            <el-option
                v-for="item in analysisStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>


        <el-form-item label="研判完成时间" prop="analysisEndTime">
          <el-date-picker clearable
                          v-model="queryParams.analysisEndTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择研判完成时间">
          </el-date-picker>
        </el-form-item>

      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handleQuery">确 定</el-button>
          <el-button @click="searchOpenCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- searchTaskOpen详情对话框 -->
    <el-dialog :title="title" v-model="searchTaskOpen" width="650px" append-to-body>
      <el-form disabled ref="taskRef" :model="form"  label-width="120px">

        <h3>任务信息：</h3>

        <el-form-item label="加急状态" prop="priority">

          <el-select v-model="form.priority">
            <el-option
                v-for="dict in sys_priority"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="地区" prop="value">
          <el-cascader
              v-model="form.area"
              :options="options"
              @change="handleChange"
              filterable
              clearable
              style="width: 530px">
          </el-cascader>
        </el-form-item>

        <el-form-item label="提交单位" prop="source">
          <el-select v-model="form.source" placeholder="请选择提交单位"
                     filterable
                     clearable>
            <el-option
                v-for="dict in sourceList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>



        <el-form-item label="案件类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择案件类型"
                     filterable
                     clearable>
            <el-option
                v-for="dict in typeList"
                :key="dict.id"
                :label="dict.name"
                :value="dict.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="提交方内部编号" prop="clientCode">
          <el-input v-model="form.clientCode" placeholder="请输入提交方内部编号" />
        </el-form-item>


        <el-form-item label="URL网址" prop="url">
          <el-input v-model="form.url" placeholder="请输入URL网址" />
        </el-form-item>

        <el-form-item label="IP地址" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>


        <h3>任务状况：</h3>


        <el-form-item label="任务编号" prop="id">
          <el-input v-model="form.id"  />
        </el-form-item>


        <el-form-item label="打击进程" prop="penetrationStatus">
          <el-select
              v-model="form.penetrationStatus"
              placeholder="请选择任务打击进程"
              clearable
              style="width: 240px">
            <el-option
                v-for="dict in sys_hit_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"/>
          </el-select>
        </el-form-item>

        <el-form-item label="打击跟进人" prop="penetrationFollowPerson">
          <el-select v-model="form.penetrationFollowPerson"
                     filterable clearable placeholder="请选择打击跟进人">
            <el-option
                v-for="item in penetrationFollowPersonList"
                :key="item.nickName"
                :label="item.nickName"
                :value="item.nickName">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="打击状态" align="center" prop="penetrationStatusResult" width="140px">
          <el-select v-model="form.penetrationStatusResult" filterable clearable placeholder="请选择打击状态">
            <el-option
                v-for="item in statusList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="打击完成时间" prop="penetrationEndTime">
          <el-date-picker clearable
                          v-model="form.penetrationEndTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择渗透完成时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="研判进程" prop="analysisStatus">
          <el-select
              v-model="form.analysisStatus"
              placeholder="请选择任务研判进程"
              clearable
              style="width: 240px">
            <el-option
                v-for="dict in analysisStatusList"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"/>
          </el-select>
        </el-form-item>



        <el-form-item label="研判跟进人" prop="analysisFollowPerson">
          <el-select v-model="form.analysisFollowPerson"
                     filterable clearable placeholder="请选择研判跟进人">
            <el-option
                v-for="item in analysisFollowPersonList"
                :key="item.nickName"
                :label="item.nickName"
                :value="item.nickName">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="研判状态" prop="analysisStatus">
          <el-tag v-if="form.analysisStatus == 2">{{ "-----" }}</el-tag>
          <el-tag type="danger" v-else-if="form.analysisStatus == 0">{{ "未完成" }}</el-tag>
          <el-tag type="success" v-else-if="form.analysisStatus == 1">{{ "已完成" }}</el-tag>
        </el-form-item>


        <el-form-item label="研判完成时间" prop="analysisEndTime">
          <el-date-picker clearable
                          v-model="form.analysisEndTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择研判完成时间">
          </el-date-picker>
        </el-form-item>





        <el-form-item label="任务创建时间" prop="createTime">
          <el-date-picker clearable
                          v-model="form.createTime"
                          type="date"
                          value-format="YYYY-MM-DD"
                          placeholder="请选择任务创建时间">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="任务创建人" prop="createBy">
          <el-input
              v-model="form.createBy"
          />
        </el-form-item>


        <el-form-item label="后台地址" prop="backend_address">
          <el-input
              v-model="form.backendAddress"
          />
        </el-form-item>


        <el-form-item label="账号" prop="account">
          <el-input
              v-model="form.account"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
              v-model="form.password"
          />
        </el-form-item>

        <h3>备注：</h3>

        <el-form-item label="管理员备注" prop="employerRemark">
          <el-input
              v-model="form.employerRemark"
             />
        </el-form-item>


        <el-form-item label="打击人员备注" prop="penetrationRemark">
          <el-input
              v-model="form.penetrationRemark"
             />
        </el-form-item>

        <el-form-item label="研判人员备注" prop="analysisRemark">
          <el-input
              v-model="form.analysisRemark"
              />
        </el-form-item>



      </el-form>
      <template #footer>
        <div class="dialog-footer">
<!--          <el-button type="primary" @click="handleQuery">确 定</el-button>-->
          <el-button @click="searchTaskOpenCancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog :title="upload.title" v-model="upload.open" width="400px"  append-to-body>
      <el-upload
          ref="uploadRef"
          :limit="1"
          accept=".xlsx, .xls"
          :headers="upload.headers"
          :action="upload.url + '?updateSupport=' + upload.updateSupport"
          :disabled="upload.isUploading"
          :on-progress="handleFileUploadProgress"
          :on-success="handleFileSuccess"
          :auto-upload="false"
          drag
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">拖拽文件到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip text-center">
<!--            <div class="el-upload__tip">-->
<!--              <el-checkbox v-model="upload.updateSupport" />是否更新已经存在的用户数据-->
<!--            </div>-->
            <span>仅允许导入xls、xlsx格式文件。</span>
            <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">下载模板</el-link>
          </div>
        </template>
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup name="Task">
import { listTask, getTask, delTask, addTask, updateTask,masterTaskList,bindMasterTask,editContactTask, againGetIpFuntion } from "@/api/system/task";
import VDistpicker from 'v-distpicker';
const { proxy } = getCurrentInstance();
const { sys_hit_status, sys_priority } = proxy.useDict("sys_hit_status","sys_priority");
// const { data, province, city, area, town } = require("province-city-china/data");
import dataArea from 'province-city-china/dist/level.json'
import { ref, onMounted,computed } from 'vue'
import { listAllSource } from "@/api/system/source";
import { listAllType } from "@/api/system/type";
import { allListByType } from "@/api/system/status";
import { getListByRole } from "@/api/system/user";
import { getToken } from "@/utils/auth";

const taskList = ref([]);
const open = ref(false);
const addSubTask = ref(false);
const searchOpen = ref(false);
const searchTaskOpen = ref(false);
const importOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const addTaskButton = ref(true);
const deleteTaskButton = ref(true);
const againGetIpButton = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const value = ref([]);
const options = ref([]);
const sourceList = ref([]);
const typeList = ref([]);
const statusList = ref([]);
const analysisFollowPersonList = ref([]);
const penetrationFollowPersonList = ref([]);
const masterTaskListValue = ref([]);
const analysisStatusList = ref([{
  value: 0,
  label: '未完成'
}, {
  value: 1,
  label: '已完成'
}, {
  value: 2,
  label: '进行中'
}]);

/*** 任务导入参数 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/task/importData"
});

const isMasterTask = ref([{
  value: 0,
  label: '是'
}, {
  value: -1 ,
  label: '不是'
}]);

const handleChange = (value) => {
}
const dataList = dataArea

const getAreaCode = (nodeId) => {
  const parents = findAllParents(
      dataList,
      { code: nodeId },
      (item, node) => item.code === node.code
      // {
      //   props: {
      //     children: 'child'
      //   }
      // }
  )

  let codes = []
  let names = []

  for (let node of parents) {
    codes.push(node.code)
    names.push(node.name)
  }

  codes.push(nodeId)
  let dataArea = { codes: codes, names: names }
  return dataArea
}

//json.js
const defaults = {
  props: {
    children: 'children'
  }
}


const findParent = (dataArea, node, predicate, options = {}) => {
  let config = Object.assign({}, defaults, options)

  let parent = undefined
  for (let i = 0; i < dataArea.length; i++) {
    if (parent) return parent

    let item = dataArea[i]

    if (item[config.props.children] && item[config.props.children].length > 0) {
      let child = item[config.props.children].filter((c) => predicate(c, node))
      if (child.length > 0) {
        parent = item
      }

      if (parent === undefined) {
        parent = findParent(item[config.props.children], node, predicate, config)
      } else {
        break
      }
    }
  }
  return parent
}

const findAllParents = (dataArea, node, predicate, options = {}) => {
  let config = Object.assign({}, defaults, options)

  let allParents = []
  let parent = findParent(dataArea, node, predicate, config)
  while (parent !== undefined) {
    allParents.unshift(parent)
    parent = findParent(dataArea, parent, predicate, config)
  }
  return allParents
}

onMounted(() => {

  listAllSource(queryParams.value).then(response => {
    sourceList.value = response.rows;
  });

  listAllType(queryParams.value).then(response => {
    typeList.value = response.rows;
  });

  queryParams.value.statusType  = 1
  allListByType(queryParams.value).then(response => {
    statusList.value = response.rows;
  });


  queryParams.value.roleName  = "研判跟进人"
  getListByRole(queryParams.value).then(response => {
    analysisFollowPersonList.value = response.rows;
  });

  queryParams.value.roleName  = "渗透跟进人"
  getListByRole(queryParams.value).then(response => {
    penetrationFollowPersonList.value = response.rows;
  });
  queryParams.value.roleName  = null
  queryParams.value.statusType  = null





  options.value = dataArea
  options.value = options.value.map((item) => {
    return {
      value: item.name,
      label: item.name,
      children: item.children?.map((item2) => {
        return {
          value: item2.name,
          label: item2.name,
          children: item2.children?.map((item3) => {
            return {
              value: item3.name,
              label: item3.name
            }
          })
        }
      })
    }
  })
  value.value = getAreaCode('420106').codes
})



const data = reactive({
  subTaskForm:{},
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    priority: null,
    source: null,
    province: null,
    city: null,
    county: null,
    type: null,
    clientCode: null,
    url: null,
    ip: null,
    penetrationEndTime: null,
    analysisEndTime: null,
    penetrationStatus: null,
    analysisStatus: null,
    penetrationFollowPerson: null,
    analysisFollowPerson: null,
    backendAddress: null,
    account: null,
    password: null,
    employerRemark: null,
    penetrationRemark: null,
    analysisRemark: null,
    penetrationStatusResult:null,
    roleName:null,
    parentTaskId:null,
  },
  statusParams:{
  },
  rules: {
    source: [{ required: true, message: "提交单位不能为空", trigger: "change" }],
    priority: [{ required: true, message: "加急状态不能为空", trigger: "change" }],
    type: [{ required: true, message: "案件类型不能为空", trigger: "change" }],
    url: [{ required: true, message: "URL地址不能为空", trigger: "blur" }],
  }
});

const { queryParams, form, rules ,subTaskForm } = toRefs(data);

const getName = computed(() => id => {
  const obj = typeList.value.find(v => v.id == id)
  return obj?.name || '--'
})

const getStatusName = computed(() => id => {
  const obj = statusList.value.find(v => v.id == id)
  return obj?.name || '--'
})

/** 查询任务列表 */
function getList() {
  loading.value = true;
  listTask(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    taskList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}


// 取消按钮
function cancel() {
  open.value = false;
  reset();
}


function subTaskCancel() {
  addSubTask.value = false;
  reset();
  subTaskForm.value.parentTaskId=null
}

//任务绑定主任务
function submitSubTask() {
  subTaskForm.value.subTaskIds = ids.value

  bindMasterTask(subTaskForm.value).then(response => {
    proxy.$modal.msgSuccess("任务关联成功");
    addSubTask.value = false;
    getList();
    subTaskForm.value.parentTaskId=null
  });
}


// 任务取消关联
function deleteSubTask() {

  subTaskForm.value.subTaskIds = ids.value

  proxy.$modal.confirm('是否确认取消任务编号为"' + subTaskForm.value.subTaskIds + '"关联？').then(function() {
    return editContactTask(subTaskForm.value);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("关联任务取消成功");
  }).catch(() => {});

  // form.value.subTaskIds = ids.value
  // editContactTask(form.value).then(response => {
  //   proxy.$modal.msgSuccess("取消成功");
  //   getList();
  // });
}


// Ip重新获取
function againGetIp(type) {

  if (type == 'signle'){
    subTaskForm.value.subTaskIds = ids.value
  }
  subTaskForm.value.againType = type
  againGetIpFuntion(subTaskForm.value).then(response => {
    proxy.$modal.msgSuccess("ip重新获取成功");
    getList();
    subTaskForm.value.subTaskIds=null
    subTaskForm.value.againType=null
  });

}




function searchTaskOpenCancel() {
  searchTaskOpen.value = false;
  searchOpenReset();
}



function searchOpenCancel() {
  searchOpen.value = false;
  searchOpenReset();
}



// 查询表单重置
function searchOpenReset() {
  queryParams.value= {
    pageNum: 1,
    pageSize: 10,
    priority: null,
    source: null,
    province: null,
    city: null,
    county: null,
    type: null,
    clientCode: null,
    url: null,
    ip: null,
    penetrationEndTime: null,
    analysisEndTime: null,
    penetrationStatus: null,
    analysisStatus: null,
    penetrationFollowPerson: null,
    analysisFollowPerson: null,
    backendAddress: null,
    account: null,
    password: null,
    employerRemark: null,
    penetrationRemark: null,
    analysisRemark: null,
    penetrationStatusResult:null,
    roleName:null,
    createTime:null,
  };
  proxy.resetForm("taskRef");
}


// 表单重置
function reset() {
  form.value = {
    id: null,
    priority: null,
    source: null,
    province: null,
    city: null,
    county: null,
    type: null,
    clientCode: null,
    url: null,
    ip: null,
    penetrationEndTime: null,
    analysisEndTime: null,
    penetrationStatus: null,
    analysisStatus: null,
    penetrationFollowPerson: null,
    analysisFollowPerson: null,
    backendAddress: null,
    account: null,
    password: null,
    employerRemark: null,
    penetrationRemark: null,
    analysisRemark: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    penetrationStatusResult:null,
    parentTaskRadio:null,
  };
  proxy.resetForm("taskRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
  searchOpen.value = false;
}

/** 重置按钮操作 */
function resetQuery() {
  searchOpenReset();
  dateRange.value = [];
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
  addTaskButton.value = !selection.length;
  deleteTaskButton.value = !selection.length;
  againGetIpButton.value = !selection.length;

}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加任务";
}

/** 关联任务 */
function subTask() {
  reset();
  queryParams.value.parentTaskRadio = 0
  masterTaskList(queryParams.value).then(response => {
    masterTaskListValue.value = response.rows;
  });
  queryParams.value.parentTaskId = null
  addSubTask.value = true;
  title.value = "任务关联";
}


/** searchOpen按钮操作 */
function handleTaskSearch() {
  reset();
  searchOpen.value = true;
  title.value = "查询任务（非每项必填）";
}


/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getTask(_id).then(response => {
    form.value = response.data;
    form.value.priority =  response.data.priority + ''
    form.value.area = ref([ form.value.province,form.value.city,form.value.county]); // 示例值
    open.value = true;
    title.value = "修改任务";
  });
}

/** 查看按钮操作 */
function handleSearch(row) {
  reset();
  const _id = row.id || ids.value
  getTask(_id).then(response => {
    form.value = response.data;
    form.value.priority =  response.data.priority + ''
    form.value.penetrationStatus =  response.data.penetrationStatus + ''
    form.value.area = ref([ form.value.province,form.value.city,form.value.county]); // 示例值
    searchTaskOpen.value = true;
    title.value = "任务详情";
  });

}
function handleImport() {
  upload.title = "Excel导入";
  upload.open = true;
}





/** 提交按钮 */
function submitForm() {
  proxy.$refs["taskRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateTask(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addTask(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除任务编号为"' + _ids + '"的数据项？').then(function() {
    return delTask(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/task/export', {
    ...queryParams.value
  }, `task_${new Date().getTime()}.xlsx`)
}


/** 下载模板操作 */
function importTemplate() {
  proxy.download("system/task/importTemplate", {
  }, `task_template_${new Date().getTime()}.xlsx`);
};

/**文件上传中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};

/** 文件上传成功处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "导入结果", { dangerouslyUseHTMLString: true });
  getList();
};

/** 提交上传文件 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};

getList();
</script>
