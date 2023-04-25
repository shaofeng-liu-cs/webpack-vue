const loadingDirective = {};
loadingDirective.install = Vue => {
  Vue.directive('loading', {
    bind: (el, binding) => {
      const message = el.getAttribute('loading-message');
      if (binding.value) {
        window.$(el).blockUI(message);
      }
    },

    update: (el, binding) => {
      const message = el.getAttribute('loading-message');
      if (binding.oldValue !== binding.value) {
        if (binding.value) {
          window.$(el).blockUI(message);
        } else {
          window.$(el).unblockUI();
        }
      }
    },

    unbind: el => {
      window.$(el).unblockUI();
    },
  });
};
export default loadingDirective;
