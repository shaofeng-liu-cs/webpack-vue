import Vue from 'vue';
import RippleAnimation from './RippleAnimation.vue';

const RippleAnimationBox = Vue.extend(RippleAnimation);

RippleAnimation.install = data => {
  const instance = new RippleAnimationBox({
    data,
  }).$mount();
  return instance.$el;
  // document.body.appendChild(instance.$el)

  // Vue.nextTick(() => instance.show = true)
};

export default RippleAnimation;
