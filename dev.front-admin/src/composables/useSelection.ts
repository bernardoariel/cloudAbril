import { ref, computed, watch, type ComputedRef } from 'vue';

export function useSelection(items: ComputedRef<any[]>, keyField: string) {
  const selectedKeys = ref(new Set<string | number>());

  const isAllSelected = computed(() =>
    items.value.length > 0 && selectedKeys.value.size === items.value.length
  );

  watch(items, (newItems) => {
    selectedKeys.value = new Set(newItems.map(item => item[keyField]));
  }, { deep: true });

  const toggleRowSelection = (key: string | number) => {
    if (selectedKeys.value.has(key)) {
      selectedKeys.value.delete(key);
    } else {
      selectedKeys.value.add(key);
    }
  };

  const setSelectAll = (select: boolean) => {
    if (select) {
      selectedKeys.value = new Set(items.value.map(item => item[keyField]));
    } else {
      selectedKeys.value.clear();
    }
  };

  return {
    selectedKeys,
    isAllSelected,
    toggleRowSelection,
    setSelectAll,
  };
}
