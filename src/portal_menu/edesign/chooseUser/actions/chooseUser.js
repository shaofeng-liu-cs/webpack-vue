// eslint-disable-next-line no-undef
define(() => {
  const { fish } = window;
  return {
    qryUseUrs: (userDetailJSON, filter, success) => {
      fish.get('edesign/project/users/v1', fish.extend(userDetailJSON, filter), success);
    },
  };
});
