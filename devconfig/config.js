// eslint-disable-next-line  no-undef
define('webroot');
// eslint-disable-next-line import/no-dynamic-require, global-require
require({
  waitSeconds: 0,
}, ['frm/portal/Portal', 'frm/portal/RestAPIHelper.js', 'css!oss_core/edesign/lib/element-ui/index.css'], () => {
  const { fish, portal, location } = window;
  portal.appGlobal.set('commoni18n', {}); // 框架公用的
  portal.appGlobal.set('customi18n', {}); // 客户定制的
  portal.wrap = func => {
    const ctx = this;
    return () => func.apply(ctx, arguments);
  };
  fish.View.prototype.wrap = portal.wrap;
  // require([
  //   'osp-design',
  //   'oss_core/edesign/assets/config/edesign/themeConfig.js',
  //   'oss_core/edesign/assets/config/edesign/menuConfig.js',
  //   'oss_core/edesign/assets/config/edesign/styleConfig.js',
  // ], function(OspDesign, theme, menu, style) {
  //   console.log(menu);
  //   let menuParams = null;
  //   let url = location.href;
  //   let tmp1 = url.split('?')[1];
  //   if (tmp1) {
  //     menuParams = JSON.parse(localStorage.getItem('menuParams'));
  //   }
  //   console.log(tmp1);
  //   console.log(menuParams);
  //   let options = Object.assign({}, theme, menu, style, { data: menuParams });
  //   // 模拟登陆 admin 11(MTE=) / designer_a
  //   let option = {
  //     data: {
  //       password: fish.Base64.encode('11'),
  //       username: 'admin',
  //     },
  //     url: 'login',
  //     success: () => {
  //       fish.get('logged', function(data) {
  //         if (data._csrf && data._csrf.token) {
  //           portal.appGlobal.set('_csrf', data._csrf.token);
  //           portal.appGlobal.set('_csrf_header', data._csrf.headerName);
  //           portal.appGlobal.set('_csrf_parameterName', data._csrf.parameterName);
  //         }
  //         OspDesign.main(options);
  //       });
  //     },
  //   };
  //   fish.postBasic(option);
  // });
  let menuParams = null;
  const url = location.href;
  let tmp1 = url.split('?')[1];
  if (tmp1) {
    tmp1 = tmp1.split('=');
    menuParams = JSON.parse(localStorage.getItem(tmp1[1]));
    if (!menuParams || menuParams.choose !== tmp1[1]) {
      menuParams = {
        [tmp1[0]]: tmp1[1],
      };
      localStorage.setItem('menuParams', JSON.stringify(menuParams));
    }
  }
  // console.log('tmp1', tmp1);
  // console.log('menuParams', menuParams);
  if (menuParams && !menuParams.choose.startsWith('Project')) {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require([
      'oss_core/edesign/view/new-osp-design.js',
      'oss_core/edesign/assets/config/edesign/themeConfig.js',
      'oss_core/edesign/assets/config/edesign/menuConfig.js',
      'oss_core/edesign/assets/config/edesign/styleConfig.js',
      'oss_core/edesign/assets/config/edesign/parameterSetConfig.js',
    ], (OspDesign, theme, menu, style, parameterSet) => {
      const options = Object.assign({}, theme, menu, style, { parameterSet }, { data: menuParams });
      OspDesign.main(options);
    });
  } else {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    require([
      'oss_core/edesign/view/project.js',
      'oss_core/edesign/assets/config/edesign/themeConfig.js',
      'oss_core/edesign/assets/config/edesign/menuConfig.js',
      'oss_core/edesign/assets/config/edesign/styleConfig.js',
    ], (Project, theme, menu, style) => {
      const options = Object.assign({}, theme, menu, style, { data: menuParams });
      // 模拟登陆 admin 11(MTE=) / designer_a
      const option = {
        data: {
          password: fish.Base64.encode('11'),
          username: 'admin',
        },
        url: 'login',
        success: () => {
          fish.get('logged', data => {
            if (data._csrf && data._csrf.token) {
              portal.appGlobal.set('_csrf', data._csrf.token);
              portal.appGlobal.set('_csrf_header', data._csrf.headerName);
              portal.appGlobal.set('_csrf_parameterName', data._csrf.parameterName);
            }
            Project.main(options);
          });
        },
      };
      fish.postBasic(option);
    });
  }
  // require([
  //   'plan',
  //   'oss_core/edesign/assets/config/edesign/themeConfig.js',
  //   'oss_core/edesign/assets/config/plan/menuConfig.js',
  //   'oss_core/edesign/assets/config/edesign/styleConfig.js',
  // ], function(plan, theme, menu, style) {
  //   let options = Object.assign({}, theme, menu, style);
  //   // 模拟登陆 admin 11(MTE=) / designer_a
  //   let option = {
  //     data: {
  //       password: fish.Base64.encode('11'),
  //       username: 'admin',
  //     },
  //     url: 'login',
  //     success: () => {
  //       fish.get('logged', function(data) {
  //         if (data._csrf && data._csrf.token) {
  //           portal.appGlobal.set('_csrf', data._csrf.token);
  //           portal.appGlobal.set('_csrf_header', data._csrf.headerName);
  //           portal.appGlobal.set('_csrf_parameterName', data._csrf.parameterName);
  //         }
  //         plan.main(options);
  //       });
  //     },
  //   };
  //   fish.postBasic(option);
  // });
  // require(['oss_core/edesign/attributionAction/views/attrAction.js'], function(attrAction) {
  //     let option = {
  //         data: {
  //             password: 'MTE=',
  //             username: 'admin',
  //         },
  //         url: 'login',
  //         success: () => {
  //             fish.get('logged', function(data) {
  //                 if (data._csrf && data._csrf.token) {
  //                     portal.appGlobal.set('_csrf', data._csrf.token);
  //                     portal.appGlobal.set('_csrf_header', data._csrf.headerName);
  //                     portal.appGlobal.set('_csrf_parameterName', data._csrf.parameterName);
  //                 }
  //                 // OspDesign.main(options);
  //                 let view = new attrAction();
  //                 view.render();
  //                 console.log(attrAction);
  //             });
  //         },
  //     };
  //     fish.postBasic(option);
  // });
  // require(['./login.js'], function(Login) {
  //     new Login().render();
  // });
  // require(['manager-map'], function (OspDesign) {
  //     OspDesign.main({schemaId: '210312104800432665'});
  // });

  // require(['designer-map'], function (OspDesign) {
  //     OspDesign.main({orderId: "210416101800360935"});
  // });

  // require(['dashboard'], function (dashboard) {
  //     dashboard.main();
  // });
});
