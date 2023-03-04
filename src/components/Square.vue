<template>
  <button class="square" :class="this.class, [fail]"/>
</template>

<script>
export default {
  name: 'Square',
  props: ['data', 'state'],
  data() {
    return {
      pressed: false,
    }
  },
  computed: {
    class() {
      const {  data: { is_mine, mines, is_open, flag, question}} = this;
      if (is_open) return is_mine ? 'mine' : `n${mines}`;
      if (this.pressed) return this.pressed ? 'pressed' : '';
      if (flag || question) return flag ? 'flag' : 'question';
      return undefined
    },
    fail() {
      const {data: {is_mine, flag, mineClick}, state: {finished}} = this;
      if (mineClick) return mineClick ? 'red' : '' ;
      if (finished && (flag && !is_mine)) return !is_mine ? 'notMine' : 'flag';
    }
 },
}
</script>
