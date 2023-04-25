const { fish } = window;

export function restSuccess(result) {
  return new Promise(resolve => {
    if (typeof result === 'object' && result.hasOwnProperty.call(result, 'success')) {
      if (result.success) {
        resolve(result);
      } else {
        fish.warn(`${result.code}: ${result.message}`);
      }
    } else {
      resolve(result);
    }
  });
}
export function restError(oldUrl) {
  return (xhr, status, error) =>
    new Promise(reject => {
      // #1586 url中包含xss攻击得情况
      const url = fish.escape(oldUrl);
      if (xhr && xhr.responseText) {
        let errorObj = {};
        try {
          errorObj = JSON.parse(xhr.responseText);
        } catch (e) {
          fish.error(xhr.responseText); // responseText: "This session has been expired (possibly due to multiple concurrent logins being attempted as the same user)."
          reject(error);
          return;
        }

        if (errorObj) {
          if (errorObj.type === undefined) {
            // 请求异常
            let msg;
            if (JSON.parse(xhr.responseText) && JSON.parse(xhr.responseText).message) {
              msg = `${url} ${JSON.parse(xhr.responseText).message}`;
            } else {
              msg = `${url} ${error}`;
            }
            fish.error({
              title: `Ajax ${status}`,
              message: msg,
            });
          } else if (errorObj.type === 0) {
            // 业务异常
            fish.warn(`${errorObj.code}: ${errorObj.message}`);
          } else if (errorObj.code === 'S-SYS-00027') {
            // 系统异常
            // Session过期
            if (portal.appGlobal.get('currentStatus') !== 'sessionTimeOut') {
              portal.appGlobal.set('currentStatus', 'sessionTimeOut');
            }
          } else if (errorObj.code === 'S-SYS-00029') {
            // 账号被挤下线
            if (portal.appGlobal.get('currentStatus') !== 'beenSqueezedOffline') {
              portal.appGlobal.set('currentStatus', 'beenSqueezedOffline');
            }
          } else {
            fish.error(errorObj.message);
          }
        } else {
          fish.error({
            title: `Ajax ${status}`,
            message: `${url} ${error}`,
          });
        }
      } else {
        // 请求异常
        fish.error({
          title: `Ajax ${status}`,
          message: `${url} ${error}`,
        });
      }
      reject(error);
    });
}
