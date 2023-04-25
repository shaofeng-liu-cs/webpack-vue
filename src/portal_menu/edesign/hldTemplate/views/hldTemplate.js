// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/hldTemplate/templates/hldTemplate.html',
  'i18n!oss_public/opb/i18n/opb.comm',
  'i18n!oss_core/edesign/hldTemplate/i18n/hldtemplate',
  'oss_core/edesign/hldTemplate/actions/hldTemplateAction',
  'css!oss_core/edesign/hldTemplate/css/hldTemplate.css',
], (template, i18nOpb, i18nObject, HLDTemplateAction) => {
  const { fish, $, portal } = window;
  return portal.BaseView.extend({
    i18nData: fish.extend({}, i18nOpb, i18nObject),
    template: fish.compile(template),
    events: {
      'click #btnAddTemplate': 'addTemplate',
    },

    initialize: opts => {
      this.option = fish.extend({}, this.option, opts);
    },

    render: () => {
      this.$el.html(this.template(this.i18nData));
      return this;
    },

    afterRender: () => {
      this.initTree();
      this.initAllInfo();
      this.listenSearchChange();
    },

    // 获取左侧树节点内容
    queryResTypeAction: () => {
      // 这里先写死一个projectId
      HLDTemplateAction.qryResourceType(data => {
        const allData = data.resultList;
        if (allData) {
          this.allRes = (allData || []).filter(it => it.resGroup !== 'Space Network');
          const nodeList = this.getResouceTypeNodeData(this.allRes);
          this.$objTree.tree('reloadData', nodeList);
        }
      });
    },

    // 进行增删改树节点以后的刷新以及初始化页面操作
    initAllInfo: () => {
      this.queryResTypeAction();
      this.initTemplateListGrid();
      this.initGISAttrRelationGrid();
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
      const showData = this.allRes.filter(item => {
        const str = item.resTypeDesc;
        const patt = new RegExp(searchName, 'ig');
        if (patt.test(str)) {
          return item;
        }
        return false;
      });
      const nodeList = this.getResouceTypeNodeData(showData);
      this.$objTree.tree('reloadData', nodeList);
    },

    initTree: () => {
      const options = {
        data: {
          key: {
            // name: "resTypeDesc"
          },
          simpleData: {
            enable: true,
          },
        },
        view: {
          fontCss: this.wrap(this.getFontCss),
        },
        callback: {
          onClick: this.wrap(this.initTemplateList),
        },
        fNodes: [],
      };
      this.$objTree = this.$('#resourceTypeTree').tree(options);
    },
    handleSettingStyle: data => {
      const that = this;
      // eslint-disable-next-line import/no-dynamic-require, global-require
      require(['oss_core/edesign/hldTemplate/views/SettingStyle'], ModifyProject => {
        const styleJson = Object.keys(that.styleJsonObj || {}).length ? that.styleJsonObj : data.styleJson || {};
        const modifyProject = new ModifyProject({
          type: 'new',
          resType: that.currentResType,
          ...data,
          styleJson,
          GISDATA: that.gridGIS.grid('getRowData'),
        });
        modifyProject.render();
        that.settingStyleProject = modifyProject;
        this.listenTo(modifyProject, 'OKEvent', res => {
          that.styleJsonObj = res || {};
          that.setShowTemImgSrc(res.iconUrl, data._id_);
        });
      });
    },
    setShowTemImgSrc: (src, id) => {
      const dom = this.$(`#${id}_template_img`);
      if (dom.length) {
        dom.attr('src', src);
      } else {
        const imgspan = this.$(`#${id}_template_img_span`);
        $(`<img src="${src}" id="${id}_template_img" style="width:22px;max-height:30px;" />`).appendTo(imgspan);
      }
    },
    initTemplateListGrid: tableData => {
      const that = this;
      this.hldListGrid = $('#templateListGrid').grid({
        data: tableData,
        height: '100%',
        scroll: true,
        colModel: [
          {
            name: 'templateName',
            width: 200,
            editable: true,
            sortable: false,
            editrules: 'required;length[~80]',
            label: this.i18nData.HLD_TEMPLATE_NAME,
          },
          {
            name: 'templateDesc',
            width: 200,
            editable: true,
            editrules: 'length[~160]',
            sortable: false,
            label: this.i18nData.TEMPLATE_DESC,
          },
          {
            name: 'iconUrl',
            width: 200,
            classes: 'overNoHiden',
            sortable: false,
            editable: true,
            label: this.i18nData.TEMPLATE_ICON,
            editinit: (tpl, cellval, opts, rwdata) => {
              that.editRowId && that.hldListGrid.grid('restoreRow', that.editRowId);
              that.editRowId = rwdata._id_;
            },
            edittype: (cellval, opts, rwdata) => {
              const showimg = rwdata.iconUrl
                ? `<img src="${rwdata.iconUrl}" id="${rwdata._id_}_template_img" style="width:22px;max-height:30px;" />`
                : `<span id="${rwdata._id_}_template_img_span"></span>`;
              // return "<button type='button' class='btn btn-default settingStyleBtn'" + ' >' + showimg + " <span class='caret'></span></button>";
              return `<button type='button' class='btn btn-default settingStyleBtn'>${showimg}<span class='caret'></span></button>`;
            },
            formatter: (cellval, opts, rwdat) => {
              const showimg = rwdat.iconUrl
                ? `<img src="${rwdat.iconUrl}" id="${rwdat._id_}_template_img" style="width:22px;max-height:30px;" />`
                : '';
              return showimg;
            },
          },
          {
            name: 'styleJson',
            width: 0,
            hidden: true,
          },
          {
            name: '',
            width: 100,
            formatter: 'actions',
            formatoptions: {
              editbutton: true,
              delbutton: true, // 默认开启删除功能
            },
          },
        ],
        beforeRestoreRow: () => {
          that.styleJsonObj = {};
        },
        beforeSaveRow: (e, rowid, data) => {
          let result = true;
          const successCB = resultData => {
            if (resultData === 'SUCCESS') {
              that.styleJsonObj = {};
              that.qryAllTemplateList(that.currentResType);
              result = true;
            } else {
              fish.warn('Save failed!');
              result = false;
            }
          };
          const styleJsonObj = this.styleJsonObj || {};
          if (!styleJsonObj.iconUrl && !data.iconUrl) {
            fish.warn(this.i18nData.TEMPLATE_SAVE_ERROR_NOICON);
            return false;
          }
          if (data.templateId) {
            HLDTemplateAction.editHLDTemplateInfo(
              {
                templateId: data.templateId,
                templateName: data.templateName,
                templateDesc: data.templateDesc,
                iconUrl: styleJsonObj.iconUrl || data.iconUrl,
                styleJson: Object.keys(styleJsonObj).length ? styleJsonObj : data.styleJson || {},
              },
              successCB,
            );
          } else {
            HLDTemplateAction.addNewHLDTemplateInfo(
              {
                resType: that.currentResType,
                templateName: data.templateName,
                templateDesc: data.templateDesc,
                iconUrl: styleJsonObj.iconUrl || data.iconUrl,
                styleJson: Object.keys(styleJsonObj).length ? styleJsonObj : data.styleJson || {},
              },
              successCB,
            );
          }
          return result;
        },
        beforeDeleteRow: (e, rowid, data) => {
          HLDTemplateAction.deleteHLDTemplate(data.templateId, resultData => {
            if (resultData === 'SUCCESS') {
              that.qryAllTemplateList(that.currentResType);
            } else {
              fish.warn('Save failed!');
            }
          });
          return false;
        },
        onSelectRow: (e, rowid) => {
          const rowData = that.$('#templateListGrid').grid('getRowData', rowid);
          if (rowData.templateId) {
            that.initGISAttrRelationList(rowData.templateId);
          } else {
            // 这里新增的列，还未保存，需要清除右边的数据等
            that.templateId = null;
            that.gridGIS.grid('reloadData', []);
          }
        },
      });
      this.hldListGrid.on('click', '.settingStyleBtn', () => {
        const selRow = this.hldListGrid.grid('getSelection');
        that.handleSettingStyle(selRow);
      });
    },

    initGISAttrRelationGrid: tableData => {
      const that = this;
      this.gridGIS = $('#gridGISAttrRelation').grid({
        height: '100%',
        data: tableData,
        scroll: true,
        autoPaged: true, // 启动分页加载
        page: 1,
        colModel: [
          {
            name: 'attrDesc',
            width: 200,
            label: this.i18nData.ATTRIBUTE_NAME,
            editable: true,
            sortable: false,
            disabledField: true,
            edittype: (cellval, opts, rwdata) =>
              `<input type="text" id="${rwdata._id_}_attribute_name" name="attribute_name" class="form-control constant">`,
            editinit: (tpl, cellval, opts, rwdata) => {
              this.$(`#${rwdata._id_}_attribute_name`).val(rwdata.attrDesc);
              this.$(`#${rwdata._id_}_attribute_name`).attr('disabled', true);
            },
            editvalue: (opts, rwdata) => this.$(`#${rwdata._id_}_attribute_name`).val(),
          },
          {
            name: 'attrValueName',
            label: this.i18nData.ATTRIBUTE_VALUE,
            width: 200,
            editable: true,
            sortable: false,
            edittype: (cellval, opts, rwdata) => {
              //  首先判断是不是下拉框，再判断是不是数字或者字符串
              if (rwdata.attrValues && rwdata.attrValues.length > 0) {
                return '<input type="text" name="attribute_value" class="form-control srcCombobox">';
              }
              if (rwdata.dataType === 'N') {
                return `<input type="number" id="${rwdata._id_}_attribute_value" name="attribute_value" class="form-control constant">`;
              }
              return `<input type="text" id="${rwdata._id_}_attribute_value" name="attribute_value" class="form-control constant">`;
            },
            editinit: (tpl, cellval, opts, rwdata) => {
              if (rwdata.attrValues && rwdata.attrValues.length > 0) {
                const srcAttribute = rwdata.attrValues.map(item => ({ name: item.valueDesc, value: item.attrValue }));
                this.$('.srcCombobox').combobox({
                  dataTextField: 'name',
                  dataValueField: 'value',
                  dataSource: srcAttribute,
                  change: e => {
                    const { value } = e.target;
                    rwdata.attrValue = value;
                    rwdata.valueDesc = this.$('.srcCombobox').combobox('text');
                    rwdata.attrValueName = this.$('.srcCombobox').combobox('text');
                  },
                });
                this.$('.srcCombobox').combobox('value', rwdata.attrValue);
              } else {
                this.$(`#${rwdata._id_}_attribute_value`).val(rwdata.attrValueName);
              }
            },
            editvalue: (opts, rwdata) => {
              if (rwdata.attrValues && rwdata.attrValues.length > 0) {
                return this.$('.srcCombobox').combobox('text');
              }
              return this.$(`#${rwdata._id_}_attribute_value`).val();
            },
          },
          {
            width: 100,
            name: '',
            formatter: 'actions',
            formatoptions: {
              editbutton: true,
              delbutton: false, // 默认开启删除功能
            },
          },
        ],
        beforeSaveRow: (e, rowid, data) => {
          let result = true;
          const successCB = resultData => {
            if (resultData === 'SUCCESS') {
              that.qryAttributeRelation(that.currentResType, that.currentTemplateId);
              result = true;
            } else {
              fish.warn('Save failed!');
              result = false;
            }
          };
          const isSelectBox = data.attrValues && data.attrValues.length > 0;
          HLDTemplateAction.editGISAttributeInfo(
            {
              attrId: data.attrId,
              attrValue: isSelectBox ? data.attrValue : data.attrValueName,
              templateId: that.currentTemplateId,
              resType: that.currentResType,
            },
            successCB,
          );
          return result;
        },
        beforeDeleteRow: (e, rowid, data) => {
          HLDTemplateAction.deleteGISAttribute(data.attrId, that.currentTemplateId, resultData => {
            if (resultData === 'SUCCESS') {
              return true;
            }
            fish.warn('Save failed!');
            return false;
          });
        },
      });
    },
    getFontCss: treeNode => (treeNode.highlight ? { color: '#2d8ae8', 'font-weight': 'bold' } : { color: '', 'font-weight': 'normal' }),
    initTemplateList: (event, treeNode) => {
      // 查询子模板并显示
      if (treeNode.parentTId) {
        const findRes = this.allRes.filter(item => item.resTypeDesc === treeNode.name);
        this.initTemplateListGrid();
        this.qryAllTemplateList(findRes[0].resTypeId);
      }
    },

    qryAllTemplateList: type => {
      this.currentResType = type;
      HLDTemplateAction.qryAllHLDTemplateList({ resType: type }, data => {
        const tableData = data.map(item => ({
          templateName: item.templateName,
          templateDesc: item.templateDesc,
          templateId: item.templateId,
          iconUrl: item.iconUrl,
          styleJson: item.styleJson,
        }));
        this.$('#templateListGrid').grid('reloadData', tableData);
      });
    },

    initGISAttrRelationList: templateId => {
      this.currentTemplateId = templateId;
      this.qryAttributeRelation(this.currentResType, templateId);
    },

    qryAttributeRelation: (resType, templateId) => {
      HLDTemplateAction.qryGISAttributeList(resType, templateId, data => {
        const tableData = data.map(item => {
          if (item.attrValues && item.attrValues.length > 0) {
            if (item.attrValue) {
              const findAttrItem = item.attrValues.find(obj => obj.attrValue === item.attrValue);
              if (findAttrItem) {
                return {
                  ...item,
                  attrValueName: findAttrItem.valueDesc,
                };
              }
            }
          } else {
            return {
              ...item,
              attrValueName: item.attrValue,
            };
          }
          return item;
        });
        this.gridGIS.grid('reloadData', tableData);
      });
    },

    addTemplate: () => {
      const selrow = this.$objTree.tree('getSelectedNodes');
      if (fish.isEmpty(selrow) || selrow[0].parentTId === null) {
        fish.warn(this.i18nData.COMMON_SELECT_RECORD_CONTENT);
      } else {
        // 新增一行
        $('#templateListGrid').grid('addRow', {});
      }
    },

    getResouceTypeNodeData: allData => {
      const superParentName = [];
      allData.forEach(groupA => {
        if (superParentName.indexOf(groupA.resGroup) === -1) {
          superParentName.push(groupA.resGroup);
        }
      });
      const parent = [];
      superParentName.forEach(name => {
        const child = [];
        allData.forEach(left => {
          if (name === left.resGroup) {
            child.push({
              name: left.resTypeDesc,
              resType: left.resTypeId,
            });
          }
        });
        parent.push({
          name,
          children: child,
          open: true,
          disabled: true,
        });
      });
      return parent.filter(lef => lef.children.length > 0);
    },
  });
});
