/* @Author: HongAnDing
 * @Date: 2022-07-12 16:04:40
 * @LastEditors: HongAnDing
 * @LastEditTime: 2022-07-18 11:12:22
 * @Description: file content
 */
// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/attributionAction/templates/attrAction.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/attributionAction/i18n/attraction',
  'oss_core/edesign/attributionAction/actions/attrActionAction',
  'css!oss_core/edesign/attributionAction/css/attr.css',
], (template, i18nOpb, i18nObject, AttrActionAction) => {
  const { fish, portal, $ } = window;
  return portal.BaseView.extend({
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    template: fish.compile(template),
    // el: '#osp',
    // serialize:this.i18nData,
    events: {
      'click #btnAddLayerAction': 'addLayAct',
      'click #btnModLayerAction': 'modLayAct',
      'click #btnDelLayerAction': 'delLayAct',
      'click #btnSearchAttrEdnRes': 'searchAct',
      'click #btnAddAttrEdnRes': 'addAttrEdnRes',
      'click #btnDelAttrEdnRes': 'delAttrEdnRes',
      'click #btnSaveObjEDNRes': 'saveObjRes',
      'click #btnRefreshObjEDNRes': 'refresh',
    },
    initialize: opts => {
      this.option = fish.extend({}, this.option, opts);
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      return this;
    },
    afterRender: () => {
      this.$('#attr_map').show();
      this.$('#attr_mer').hide();
      this.$('#attr').hide();
      this.initTree();
      this.initAllInfo();
      this.listenSearchChange();
    },
    // 获取左侧树节点内容
    queryAttrAction: () => {
      AttrActionAction.qryLayerAction(data => {
        const parent = [
          {
            name: 'Copy',
            isParent: true,
            children: [],
            open: true,
          },
          {
            name: 'Merge',
            isParent: true,
            children: [],
            open: true,
          },
        ];
        const dataList = data || [];
        this.showDataList = data;
        dataList.forEach(item => {
          if (item.actionType === 'C') {
            parent[0].children.push({
              name: item.actionName,
            });
          } else if (item.actionType === 'M') {
            parent[1].children.push({
              name: item.actionName,
            });
          }
        });
        this.$objTree.tree('reloadData', parent);
      });
    },
    // 左侧添加按钮触发事件
    addLayAct: () => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/attributionAction/views/layerActionPop'], LayerActionPop => {
        const opts = {
          operState: 'A',
          POP_TITLE: this.i18nData.NEW_LAYER_ACTION,
          showDataList: this.showDataList,
        };
        const layActPopView = new LayerActionPop(opts);
        layActPopView.render();
        this.listenTo(layActPopView, 'okCompleted', () => {
          this.initAllInfo();
        });
      });
    },
    //     let opts = {
    //                 operState: 'A',
    //                 POP_TITLE: this.i18nData.NEW_LAYER_ACTION,
    //                 showDataList: this.showDataList,
    //     };
    //     fish.popupView({
    //         url:'oss_core/edesign/attributionAction/views/layerActionPop',
    //         viewOption:opts,
    //     }).then(function(view) {
    //         view.on('close', function() {
    //             this.queryAttrAction();
    //             console.log('popupView closed');
    //         })
    //     });
    //     // this.queryAttrAction();
    // },
    // 获取当前的树节点信息
    // getTreeNodeInfo:function(){
    //     this.treeNodeInfo = this.$objTree.tree('getSelectedNodes');
    //     this.treeNodeData= this.showDataList.find(item => item.actionName == selrow[0].name);
    //         console.log(params);
    // },
    // 编辑复制属性的信息
    modLayAct: () => {
      const selrow = this.$objTree.tree('getSelectedNodes');
      if (fish.isEmpty(selrow) || selrow[0].parentTId === null) {
        fish.warn(this.i18nData.EDN_ATTR_SELECT_RECORD_CONTENT);
      } else {
        const params = this.showDataList.find(item => item.actionName === selrow[0].name);
        if (params.sysFlag === 'S') {
          fish.warn(this.i18nData.EDN_ATTR_EDIT_ADMIT);
        } else {
          // eslint-disable-next-line import/no-dynamic-require, global-require
          require(['oss_core/edesign/attributionAction/views/layerActionPop'], LayerActionPop => {
            const opts = {
              operState: 'M',
              POP_TITLE: this.i18nData.MOD_LAYER_ACTION,
              params,
              showDataList: this.showDataList,
            };
            const layActPopView = new LayerActionPop(opts);
            layActPopView.render();
            // 每次编辑完刷新去查询属性列表刷新树节点显示
            this.listenTo(layActPopView, 'okCompleted', () => {
              this.initAllInfo();
            });
          });
        }
      }
    },
    // 删除左侧树节点
    delLayAct: () => {
      const selrow = this.$objTree.tree('getSelectedNodes');
      if (fish.isEmpty(selrow) || selrow[0].parentTId === null) {
        fish.warn(this.i18nData.EDN_ATTR_SELECT_RECORD_CONTENT);
      } else {
        const findRes = this.showDataList.filter(item => item.actionName === selrow[0].name);
        if (findRes[0].sysFlag === 'S') {
          fish.warn(this.i18nData.EDN_ATTR_DEL_ADMIT);
        } else {
          const params = {
            actionId: findRes[0].actionId,
          };
          fish.confirm(this.i18nData.EDN_ATTR_DELETE_TIPS, () => {
            AttrActionAction.delLayerAction(params, () => {
              this.initAllInfo();
            });
          });
        }
      }
    },
    // 进行增删改树节点以后的刷新以及初始化页面操作
    initAllInfo: () => {
      this.queryAttrAction();
      this.initAttrMapGrid();
      this.initSourceAttrGrid();
      this.initToTypeAttrGrid();
    },
    // 监听搜索框的值进行搜索过滤
    listenSearchChange: () => {
      const that = this;
      this.$('#searchValue').bind('input propertychange', () => {
        that.searchAct();
      });
    },
    // 点击搜索框对搜索条件进行过滤
    searchAct: () => {
      const searchName = this.$('#searchValue').val();
      const parent = [
        {
          name: 'Copy',
          isParent: true,
          children: [],
          open: true,
        },
        {
          name: 'Merge',
          isParent: true,
          children: [],
          open: true,
        },
      ];
      const showData = this.showDataList.filter(item => {
        const str = item.actionName;
        const patt = new RegExp(searchName, 'ig');
        if (patt.test(str)) {
          return item;
        }
        return false;
      });
      showData.forEach(item => {
        if (item.actionType === 'C') {
          parent[0].children.push({
            name: item.actionName,
          });
        } else if (item.actionType === 'M') {
          parent[1].children.push({
            name: item.actionName,
          });
        }
      });
      this.$objTree.tree('reloadData', parent);
    },
    initTree: () => {
      const options = {
        data: {
          key: {
            // name: "resTypeDesc"
          },
          simpleData: {
            enable: true,
            // idKey: "resTypeId",
            // pIdKey: "resGroup",
            // rootPId: null
          },
        },
        view: {
          // showIcon: false,
          fontCss: this.wrap(this.getFontCss),
        },
        callback: {
          onClick: this.wrap(this.initAttrInfo),
        },
        fNodes: [],
      };
      this.$objTree = this.$('#layerActionTree').tree(options);
    },
    initAttrMapGrid: tableData => {
      this.$('#attrMap').grid({
        data: tableData,
        height: '100%',
        shrinkToFit: true,
        colModel: [
          {
            name: 'iphone_desc',
            width: 200,
            editable: true,
            label: this.i18nData.SOURCE_ATTR,
            edittype: () => {
              const tpl = '<input type="text" name="name2" class="form-control srcCombobox">';
              return tpl;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              const srcAttribute = this.showAttrSrcActionList.map(item => ({ name: item.attrName, value: item.attrId }));
              this.$('.srcCombobox').combobox({
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: srcAttribute,
                change: e => {
                  const { value } = e.target;
                  rwdata.iphone = value;
                  rwdata.iphone_desc = this.$('.srcCombobox').combobox('text');
                  if (value) {
                    this.$('.constant').attr('disabled', true);
                    this.$('.constant').val('');
                  } else {
                    this.$('.constant').attr('disabled', false);
                  }
                },
              });
              this.$('.srcCombobox').combobox('value', rwdata.iphone);
            },
            editvalue: () => this.$('.srcCombobox').combobox('text'),
          },
          {
            name: 'constant',
            width: 200,
            editable: true,
            label: this.i18nData.CONSTANT,

            edittype: () => {
              const tpl = '<input type="text" name="name2" class="form-control constant">';
              return tpl;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              const that = this;
              this.$('.constant').val(rwdata.constant);
              this.$('.constant').bind('input propertychange', () => {
                if ($(this).val()) {
                  that.$('.srcCombobox').combobox('disable');
                  that.$('.srcCombobox').combobox('value', '');
                } else {
                  that.$('.srcCombobox').combobox('enable');
                }
              });
            },
            editvalue: () => {
              this.$('.constant').attr('disabled', true);
              return this.$('.constant').val();
            },
          },
          {
            name: 'name_desc',
            label: this.i18nData.TO_ATTR,
            width: 200,
            editable: true,
            edittype: () => {
              const tpl = '<input type="text" name="name2" class="form-control toCombobox">';
              return tpl;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              const dstAttribute = this.showAttrDstActionList.map(item => ({ name: item.attrName, value: item.attrId }));
              this.$('.toCombobox').combobox({
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: dstAttribute,
                change: e => {
                  const { value } = e.target;
                  rwdata.name = value;
                  rwdata.name_desc = this.$('.toCombobox').combobox('text');
                },
              });
              this.$('.toCombobox').combobox('value', rwdata.name);
            },
            editvalue: () => this.$('.toCombobox').combobox('text'),
          },
          {
            name: 'type',
            width: 200,
            editable: true,
            label: this.i18nData.TYPE,

            edittype: () => {
              const tpl = '<input type="text" class="form-control type">';
              return tpl;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              if (rwdata.type) {
                this.$('.type').val(rwdata.type);
              } else {
                this.$('.type').val('user');
              }
              this.$('.type').attr('disabled', true);
            },
            editvalue: () => this.$('.type').val(),
          },
          {
            name: 'action',
            width: 100,
            formatter: 'actions',
            formatoptions: {
              editbutton: rowdata => {
                if (rowdata.type === 'system') {
                  return false;
                }
                return true;
              },
              delbutton: false, // 默认开启删除功能
            },
          },
        ],
        multiselect: true,
      });
    },
    initAttrMerGrid: tableData => {
      $('#attrMap').grid({
        data: tableData,
        height: '100%',
        // width: 720,
        shrinkToFit: true,
        colModel: [
          {
            name: 'iphone_desc',
            width: 200,
            editable: true,
            label: this.i18nData.ATTR_TO_MER,
            edittype: () => {
              const tpl = '<input type="text" name="name2" class="form-control merCombobox">';
              return tpl;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              const srcAttribute = this.showAttrSrcActionList.map(item => ({ name: item.attrName, value: item.attrId }));
              this.$('.merCombobox').combobox({
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: srcAttribute,
                change: e => {
                  const { value } = e.target;
                  rwdata.iphone = value;
                  rwdata.iphone_desc = this.$('.merCombobox').combobox('text');
                },
              });
              // const res = this.showActionItemList.find(item => item.srcAttrName == rwdata.iphone_desc);
              // if (!fish.isEmpty(res)) {
              //     this.actionItemId = res.actionItemId;
              // } else {
              //     this.actionItemId = '';
              // }
              // this.merRes = res;
              this.$('.merCombobox').combobox('value', rwdata.iphone);
            },
            editvalue: () => this.$('.merCombobox').combobox('text'),
          },
          {
            name: 'name',
            label: this.i18nData.DESC,
            width: 200,
            editable: true,
            disabledField: true,
            edittype: () => {
              const tpl = '<input type="text" name="name2" class="form-control desCombobox">';
              return tpl;
            },
            editinit: () => {
              const srcAttribute = this.showAttrSrcActionList.map(item => ({ name: item.attrDesc, value: item.attrDesc }));
              this.$('.desCombobox').combobox({
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: srcAttribute,
              });
              this.$('.desCombobox').combobox('disable');
            },
            editvalue: () => {
              const res = this.showAttrSrcActionList.find(item => item.attrId === this.$('.merCombobox').val());
              return res.attrDesc;
            },
          },
          {
            name: 'type',
            width: 200,
            editable: true,
            label: this.i18nData.TYPE,

            edittype: () => {
              const tpl = '<input type="text" class="form-control type">';
              return tpl;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              if (rwdata.type) {
                this.$('.type').val(rwdata.type);
              } else {
                this.$('.type').val('user');
              }
              this.$('.type').attr('disabled', true);
            },
            editvalue: () => this.$('.type').val(),
          },
          {
            name: 'action',
            width: 100,
            formatter: 'actions',
            formatoptions: {
              editbutton: rowdata => {
                if (rowdata.type === 'system') {
                  return false;
                }
                return true;
              },
              delbutton: false, // 默认开启删除功能
            },
          },
        ],
        multiselect: true,
      });
    },
    initSourceAttrGrid: tableData => {
      // $('#gridSourceTypeAttr').height('92%');
      $('#gridSourceTypeAttr').grid({
        height: '100%',
        data: tableData,
        scroll: true,
        autoPaged: true, // 启动分页加载
        page: 1,
        // shrinkToFit: false,
        colModel: [
          {
            name: 'iphone',
            width: 250,
            label: this.i18nData.NAME,
          },
          {
            name: 'name',
            label: this.i18nData.DESC,
            width: 250,
          },
        ],
      });
    },
    initToTypeAttrGrid: tableData => {
      $('#gridToTypeAttr').grid({
        data: tableData,
        height: '100%',
        scroll: true,
        autoPaged: true, // 启动分页加载
        page: 1,
        // width: 720,
        colModel: [
          {
            name: 'iphone',
            width: 250,
            label: this.i18nData.NAME,
          },
          {
            name: 'name',
            label: this.i18nData.DESC,
            width: 250,
          },
        ],
      });
    },

    // tabActivate: function(event, ui) {},

    getFontCss: treeNode => (treeNode.highlight ? { color: '#2d8ae8', 'font-weight': 'bold' } : { color: '', 'font-weight': 'normal' }),
    initAttrInfo: (event, treeNode) => {
      // 查询子属性并显示
      if (treeNode.parentTId) {
        const findRes = this.showDataList.filter(item => item.actionName === treeNode.name);
        const params = {
          actionId: findRes[0].actionId,
        };
        if (findRes[0].actionType === 'C') {
          this.$('#attr_map').show();
          this.$('#attr_mer').hide();
          this.$('#btnRefreshObjEDNRes').show();
          this.$('#source_type_attr').show();
          this.$('#attr').hide();
          this.$('#tabToTypeAttr').show();
          $('#tabSourceTypeAttr').height('calc(50% - 4px)');
          // this.AllSrcAttrQry(findRes[0].srcType);
          this.AllDstAttrQry(findRes[0].dstType);
          this.initAttrMapGrid();
          // this.qryLayerActItem(params);
        } else {
          this.$('#attr_map').hide();
          this.$('#attr_mer').show();
          this.$('#btnRefreshObjEDNRes').hide();
          this.$('#source_type_attr').hide();
          this.$('#attr').show();
          this.$('#tabToTypeAttr').hide();
          $('#tabSourceTypeAttr').height('98%');
          this.initAttrMerGrid();
        }
        this.AllSrcAttrQry(findRes[0].srcType);
        this.qryLayerActItem(params);
      }
    },
    AllSrcAttrQry: type => {
      AttrActionAction.qryAllAttr(type, data => {
        this.showAttrSrcActionList = data.attrDTOS;
        const tableData = data.attrDTOS.map(item => ({ iphone: item.attrName, name: item.attrDesc }));
        this.$('#gridSourceTypeAttr').grid('reloadData', tableData);
      });
    },
    AllDstAttrQry: type => {
      AttrActionAction.qryAllAttr(type, data => {
        this.showAttrDstActionList = data.attrDTOS;
        const tableData = data.attrDTOS.map(item => ({ iphone: item.attrName, name: item.attrDesc }));
        this.$('#gridToTypeAttr').grid('reloadData', tableData);
      });
    },
    async qryLayerActItem(params) {
      await AttrActionAction.qryLayerActionItem(params, data => {
        this.showActionItemList = data;
        let tableData;
        if (!fish.isEmpty(data)) {
          if (!fish.isEmpty(data[0].dstAttrName)) {
            tableData = data.map(item => ({
              iphone_desc: item.srcAttrName,
              iphone: item.srcAttrId,
              constant: item.srcVal,
              type: item.sysFlag === 'S' ? 'system' : 'user',
              name_desc: item.dstAttrName,
              name: item.dstAttrId,
              itemId: item.actionItemId,
              attrId: item.actionId,
              srcType: item.srcType,
            }));
          } else {
            const resData = data.map(item => {
              for (let i = 0; i < this.showAttrSrcActionList.length; i += 1) {
                if (this.showAttrSrcActionList[i].attrId === item.srcAttrId) {
                  return { ...item, srcAttrDesc: this.showAttrSrcActionList[i].attrDesc };
                }
              }
              return false;
            });
            tableData = resData.map(item => ({
              iphone_desc: item.srcAttrName,
              iphone: item.srcAttrId,
              name: item.srcAttrDesc,
              type: item.sysFlag === 'S' ? 'system' : 'user',
              itemId: item.actionItemId,
              attrId: item.actionId,
              srcType: item.srcType,
            }));
          }
        }
        this.$('#attrMap').grid('reloadData', tableData);
        this.isEdit();
      });
    },
    // 判断中间区域的内容是否可以编辑，对不能编辑的复选框禁用
    isEdit: () => {
      const gridData = this.$('#attrMap').grid('getRowData');
      gridData.forEach(item => {
        if (item.type === 'system') {
          this.$('#attrMap').grid('setCheckDisabled', item._id_, true);
        }
      });
    },
    addAttrEdnRes: () => {
      const selrow = this.$objTree.tree('getSelectedNodes');
      if (fish.isEmpty(selrow) || selrow[0].parentTId === null) {
        fish.warn(this.i18nData.EDN_ATTR_SELECT_RECORD_CONTENT);
      } else {
        // 新增一行
        $('#attrMap').grid('addRow', {});
      }
    },
    // 批量删除功能
    delAttrEdnRes: () => {
      const selrow = this.$objTree.tree('getSelectedNodes');
      if (fish.isEmpty(selrow) || selrow[0].parentTId === null) {
        fish.warn(this.i18nData.EDN_ATTR_SELECT_RECORD_CONTENT);
      } else {
        const selarrrow = $('#attrMap').grid('getCheckRows');
        if (!fish.isEmpty(selarrrow)) {
          const resArr = selarrrow
            .filter(item => {
              if (!fish.isEmpty(item.itemId)) {
                return item;
              }
              return false;
            })
            .map(item => item.itemId);
          const params = {
            actionItemId: resArr.join(','),
          };
          fish.confirm(this.i18nData.EDN_ATTR_DELETE_TIPS, () => {
            selarrrow.map(item => $('#attrMap').grid('delRowData', item));
            AttrActionAction.delLayerActionItem(params, () => {
              this.qryLayerActItem({ actionId: this.showActionItemList[0].actionId });
            });
          });
        } else {
          fish.warn(this.i18nData.EDN_ATTR_SELECT_RECORD_CONTENT);
        }
      }
    },
    // 按save键批量保存编辑与新增的
    saveObjRes: () => {
      const selrow = this.$objTree.tree('getSelectedNodes');
      if (fish.isEmpty(selrow) || selrow[0].parentTId === null) {
        fish.warn(this.i18nData.EDN_ATTR_SELECT_RECORD_CONTENT);
      } else {
        const param = this.showDataList.find(item => item.actionName === selrow[0].name);
        const allData = this.$('#attrMap').grid('getRowData');
        // 判断信息完整性
        this.saveBtn = true;
        allData.some(item => {
          if ((item.iphone || item.constant) && item.name) {
            return false;
          }
          this.saveBtn = false;
          return true;
        });
        if (this.saveBtn) {
          const addData = allData.filter(item => fish.isEmpty(item.itemId));
          const editData = allData.filter(item => item.itemId);
          let editParams;
          let addParams;
          if (param.actionType === 'M') {
            editParams = editData.map(item => ({
              actionItemId: item.itemId,
              actionId: item.attrId,
              srcType: item.srcType,
              srcAttrId: item.iphone,
              dstAttrId: '',
            }));
            addParams = addData.map(item => ({ actionId: param.actionId, srcType: 'A', srcAttrId: item.iphone, dstAttrId: '' }));
          } else {
            editParams = editData.map(item => ({
              actionItemId: item.itemId,
              actionId: item.attrId,
              srcType: item.constant ? 'C' : 'A',
              srcAttrId: item.iphone ? item.iphone : item.constant,
              dstAttrId: item.name,
            }));
            addParams = addData.map(item => ({
              actionId: param.actionId,
              srcType: item.constant ? 'C' : 'A',
              srcAttrId: item.iphone ? item.iphone : item.constant,
              dstAttrId: item.name,
            }));
          }
          if (!fish.isEmpty(addData)) {
            AttrActionAction.addLayerActionItem(addParams, () => {
              this.qryLayerActItem({ actionId: param.actionId });
            });
          }
          AttrActionAction.editLayerActionItem(editParams, () => {
            this.qryLayerActItem({ actionId: param.actionId });
          });
        } else {
          fish.warn(this.i18nData.EDN_ATTR_INCOMPLETE);
        }
        // })
      }
    },
    // 过滤出源属性跟目标属性名字一样的
    refresh: () => {
      fish.confirm(this.i18nData.EDN_ATTR_REFRESH_TIPS, () => {
        const resData = [];
        this.showAttrSrcActionList.forEach(item => {
          for (let i = 0; i < this.showAttrDstActionList.length; i += 1) {
            if (item.attrName === this.showAttrDstActionList[i].attrName) {
              resData.push(item);
            }
          }
        });
        const tableData = resData
          .map(item => ({
            iphone_desc: item.attrName,
            iphone: item.attrId,
            constant: '',
            name_desc: item.attrName,
            name: item.attrId,
            type: 'user',
          }))
          .filter(item => {
            for (let i = 0; i < this.showActionItemList.length; i += 1) {
              if (
                !(
                  item.iphone === this.showActionItemList[i].srcAttrId &&
                  item.name === this.showActionItemList[i].dstAttrId &&
                  this.showActionItemList[i].sysFlag === 'S'
                )
              ) {
                return item;
              }
            }
            return false;
          });
        this.$('#attrMap').grid('reloadData', tableData);
      });
    },
  });
});
