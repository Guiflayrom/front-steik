<template>
  <div>
    <div align="center" class="font-semibold text-2xl mb-5">{{ title }}</div>

    <v-table height="260px">
      <thead>
        <tr>
          <th
            class="bg-blue-darken-2 text-center"
            v-for="(column, index) in columns"
            :key="index"
          >
            {{ column }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.name" class="bg-black">
          <td>{{ item.name }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title: string;
  data: Array<any>;
  columns: Array<String>;
}>();

const { title, data, columns } = toRefs(props);
</script>
