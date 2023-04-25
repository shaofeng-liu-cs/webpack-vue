// eslint-disable-next-line import/no-amd, no-undef
define([
  'text!oss_core/edesign/chooseUser/templates/chooseUser.html',
  'i18n!oss_core/edesign/chooseUser/i18n/chooseUser',
  'i18n!oss_public/opb/i18n/opb.comm',
  'oss_core/edesign/chooseUser/actions/chooseUser',
  'css!oss_core/edesign/chooseUser/css/chooseUser.css',
], (template, i18nChooseUser, i18nPublic, chooseUserAction) => {
  const { fish, $, portal, _ } = window;
  return portal.BaseView.extend({
    template: fish.compile(template),
    i18nData: fish.extend({}, i18nChooseUser, i18nPublic),
    events: {
      'click #chooseUserOk': 'chooseUserOkFunc',
      'click #chooseUserCancel': 'chooseUserCancelFunc',
      'input #userName': 'userNameInputFunc',
      'click #searchOk': 'searchUserDatas',
    },
    initialize: opts => {
      this.option = fish.extend({}, this.option, opts);
      this.dId = _.uniqueId(this.option.id);
      return this.render();
    },
    render: () => {
      this.$el.html(this.template(this.i18nData));
      this.$el.appendTo('body');
    },
    userNameInputFunc: e => {
      this.serchUserName = e.target.value;
    },
    afterRender: () => {
      const _this = this;
      this.$('.modal-title').html(this.option.id === 'projectManager' ? this.i18nData.CHOOSEUSER_TITLE_PRO : this.i18nData.CHOOSEUSER_TITLE);
      this.$('#chooseUserIMCatalog')
        .parent()
        .attr('id', `${this.option.id}div`);
      this.$('#chooseUserIMCatalog').attr('id', this.dId);
      this.contentReady();
      this.$('#userName')
        .searchbar({
          displayMode: 'tail',
          placeholder: 'Please Input Value',
        })
        .on('searchbar:search', (e, filter, value) => {
          _this.serchUserName = value;
          _this.searchUserDatas();
        });
      this.inintUsersGrid();
    },
    inintUsersGrid: () => {
      this.$userGrid = this.$('#chooseUserGrid').grid({
        colModel: [
          {
            name: 'userId',
            label: '',
            hidden: true,
            key: true,
          },
          {
            name: 'userName',
            label: this.i18nData.USER_NAME,
          },
          {
            name: 'userCode',
            label: this.i18nData.USER_CODE,
          },
          {
            name: 'phone',
            label: this.i18nData.CHOOSEUSER_PHONE,
          },
        ],
        autowidth: true,
        shrinkToFit: true,
        height: 280,
        pager: true,
        datatype: 'json',
        rowNum: 20,
        pageData: () => {
          this.searchUserDatas();
        },
        rowList: [20, 30, 50],
      });
    },
    searchUserDatas: reset => {
      this.$userGrid.grid('resize');
      const qryCondition = this.serchUserName ? { userName: this.serchUserName } : {};
      const pageLength = this.$userGrid.grid('getGridParam', 'rowNum');
      const page = reset ? 1 : this.$userGrid.grid('getGridParam', 'page');
      const sortname = this.$userGrid.grid('getGridParam', 'sortname');
      const sortorder = this.$userGrid.grid('getGridParam', 'sortorder');
      const filter = {
        pageIndex: page - 1,
        pageLen: pageLength,
      };
      if (sortname) {
        filter.orderFields = `${sortname} ${sortorder}`;
      }
      chooseUserAction.qryUseUrs(qryCondition, filter, data => {
        const userList = [];
        const delNum = 0;
        if (data.list) {
          fish.forEach(data.list, ndata => {
            userList.push(ndata);
            // if (data.userId != _this.option.loginUerId) {
            //     userList.push(data);
            // } else {
            //     delNum + 1;
            // }
          });
        }
        this.$userGrid.grid('reloadData', {
          rows: userList,
          page: data.pageNum,
          records: data.total - delNum,
        });
      });
    },

    contentReady: () => {
      const selector = `#${this.option.id}`;
      $(selector).popedit({
        url: `#${this.dId}`,
        change: (event, ui) => {
          this.trigger('OKEvent', ui);
        },
        dialogOption: {
          height: 440,
          width: 850,
          modal: true,
          open: this.wrap(this.searchUserDatas),
        },
      });
      return this;
    },
    chooseUserCancelFunc: () => {
      this.$(`#${this.dId}`).dialog('close');
    },
    chooseUserOkFunc: () => {
      const user = this.$userGrid.grid('getSelection');
      if (user.userId) {
        this.$(`#${this.dId}`).dialog('setReturnValue', {
          name: user.userName,
          value: user.userId,
          selData: user,
        });
        this.trigger('OKEvent', user);
        this.$(`#${this.dId}`).dialog('close');
      } else {
        fish.info(this.i18nData.CHOOSE_USER);
      }
    },
    resize: () => this,
  });
});
