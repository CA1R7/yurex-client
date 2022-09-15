export const initPrototypes = () => {
  Object.defineProperty(Array.prototype, "remove", {
    value: function (target: any) {
      let i = this.indexOf(target);
      if (i !== -1) this.splice(i, 1);
      return i !== -1;
    },
  });
};
