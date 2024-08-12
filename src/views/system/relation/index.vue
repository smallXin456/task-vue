<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
                  <el-form-item label="任务ID" prop="taskId">
                    <el-input
                        v-model="queryParams.taskId"
                        placeholder="请输入任务ID"
                        clearable
                        @keyup.enter="handleQuery"
                    />
                  </el-form-item>
                  <el-form-item label="对应父任务ID, 为0表示该任务为父任务" prop="parentTaskId">
                    <el-input
                        v-model="queryParams.parentTaskId"
                        placeholder="请输入对应父任务ID, 为0表示该任务为父任务"
                        clearable
                        @keyup.enter="handleQuery"
                    />
                  </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['system:relation:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="success"
            plain
            icon="Edit"
            :disabled="single"
            @click="handleUpdate"
            v-hasPermi="['system:relation:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['system:relation:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['system:relation:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="relationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
              <el-table-column label="自增主键" align="center" prop="id" />
              <el-table-column label="任务ID" align="center" prop="taskId" />
              <el-table-column label="对应父任务ID, 为0表示该任务为父任务" align="center" prop="parentTaskId" />
              <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:relation:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:relation:remove']">删除</el-button>
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

    <!-- 添加或修改任务关系对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="relationRef" :model="form" :rules="rules" label-width="80px">
                        <el-form-item label="任务ID" prop="taskId">
                          <el-input v-model="form.taskId" placeholder="请输入任务ID" />
                        </el-form-item>
                        <el-form-item label="对应父任务ID, 为0表示该任务为父任务" prop="parentTaskId">
                          <el-input v-model="form.parentTaskId" placeholder="请输入对应父任务ID, 为0表示该任务为父任务" />
                        </el-form-item>
                        <el-form-item label="备注" prop="remark">
                          <el-input v-model="form.remark" placeholder="请输入备注" />
                        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Relation">
  import { listRelation, getRelation, delRelation, addRelation, updateRelation } from "@/api/system/relation";

  const { proxy } = getCurrentInstance();

  const relationList = ref([]);
  const open = ref(false);
  const loading = ref(true);
  const showSearch = ref(true);
  const ids = ref([]);
  const single = ref(true);
  const multiple = ref(true);
  const total = ref(0);
  const title = ref("");

  const data = reactive({
    form: {},
    queryParams: {
      pageNum: 1,
      pageSize: 10,
                    taskId: null,
                    parentTaskId: null,
    },
    rules: {
                    parentTaskId: [
                { required: true, message: "对应父任务ID, 为0表示该任务为父任务不能为空", trigger: "blur" }
              ],
    }
  });

  const { queryParams, form, rules } = toRefs(data);

  /** 查询任务关系列表 */
  function getList() {
    loading.value = true;
    listRelation(queryParams.value).then(response => {
            relationList.value = response.rows;
      total.value = response.total;
      loading.value = false;
    });
  }

  // 取消按钮
  function cancel() {
    open.value = false;
    reset();
  }

  // 表单重置
  function reset() {
    form.value = {
                    id: null,
                    taskId: null,
                    parentTaskId: null,
                    createBy: null,
                    createTime: null,
                    updateBy: null,
                    updateTime: null,
                    remark: null
    };
    proxy.resetForm("relationRef");
  }

  /** 搜索按钮操作 */
  function handleQuery() {
    queryParams.value.pageNum = 1;
    getList();
  }

  /** 重置按钮操作 */
  function resetQuery() {
    proxy.resetForm("queryRef");
    handleQuery();
  }

  // 多选框选中数据
  function handleSelectionChange(selection) {
    ids.value = selection.map(item => item.id);
    single.value = selection.length != 1;
    multiple.value = !selection.length;
  }

  /** 新增按钮操作 */
  function handleAdd() {
    reset();
    open.value = true;
    title.value = "添加任务关系";
  }

  /** 修改按钮操作 */
  function handleUpdate(row) {
    reset();
    const _id = row.id || ids.value
    getRelation(_id).then(response => {
      form.value = response.data;
      open.value = true;
      title.value = "修改任务关系";
    });
  }

  /** 提交按钮 */
  function submitForm() {
    proxy.$refs["relationRef"].validate(valid => {
      if (valid) {
        if (form.value.id != null) {
          updateRelation(form.value).then(response => {
            proxy.$modal.msgSuccess("修改成功");
            open.value = false;
            getList();
          });
        } else {
          addRelation(form.value).then(response => {
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
    proxy.$modal.confirm('是否确认删除任务关系编号为"' + _ids + '"的数据项？').then(function() {
      return delRelation(_ids);
    }).then(() => {
      getList();
      proxy.$modal.msgSuccess("删除成功");
    }).catch(() => {});
  }

  /** 导出按钮操作 */
  function handleExport() {
    proxy.download('system/relation/export', {
      ...queryParams.value
    }, `relation_${new Date().getTime()}.xlsx`)
  }

  getList();
</script>s
