<template>
  <div>
    <VCard height="150px" width="150px" color="black" class="mr-5">
      <div class="d-flex align-center justify-center mt-3">
        <VIcon size="36" :style="color ? `color: ${color}` : ''" align="center"
          >{{ icon }}
        </VIcon>
        <div
          class="ml-2 font-semibold text-xs"
          :style="color ? `color: ${color}` : ''"
          align="center"
        >
          {{ title }}
        </div>
      </div>
      <div :class="[classObject]" align="center">
        {{ value }}
      </div>
    </VCard>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  icon: string;
  title: string;
  value: string;
  color: any;
}>();

const { icon, title, value, color } = toRefs(props);

const classObject = computed(() => ({
  "font-semibold": true,
  "text-5xl": value.value.length >= 3,
  "text-7xl": value.value.length < 3,
  "mt-6": value.value.length >= 3,
  "mt-2": value.value.length < 3,
}));
</script>
