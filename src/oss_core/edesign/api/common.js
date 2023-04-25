const appConfigUrl = 'oss_core/edesign/appConfig/appConfig.json';

export function getAppConfig() {
  return new Promise((resolve, reject) => {
    window.fish.get({
      url: appConfigUrl,
      dataType: 'json',
      success: result => {
        resolve(result);
      },
      error: reject,
    });
  });
}
