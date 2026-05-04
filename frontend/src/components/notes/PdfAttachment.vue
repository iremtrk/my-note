<template>
  <div class="pdf-section">
    <div class="row items-center q-gutter-sm">
      <q-btn
      v-if="!props.readonly"
        outline
        color="primary"
        icon="attach_file"
        label="PDF Yükle"
        @click="openFilePicker"
      />
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="application/pdf"
      multiple
      class="hidden-input"
      @change="handleFileChange"
    />

    <div v-if="pdfs.length" class="q-mt-md pdf-list">
      <div
        v-for="pdf in pdfs"
        :key="pdf.id"
        class="pdf-item row items-center justify-between"
      >
        <div
          class="text-body2 cursor-pointer pdf-name"
          @click="emit('preview', pdf)"
        >
          <strong>{{ pdf.name }}</strong>
        </div>

        <q-btn
          v-if="!props.readonly"
          flat
          round
          dense
          color="negative"
          icon="close"
          @click="openDeleteConfirm(pdf.id)"
        />
      </div>
    </div>
    <ConfirmDelete
      v-model="showDeleteConfirm"
      :title="t('pdf.deleteTitle')"
      :message="t('pdf.deleteMessage')"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { NotePdf } from "@/types/notes";
import ConfirmDelete from "@/common/ConfirmDelete.vue";
import { useI18n } from "vue-i18n";
import api from "@/lib/axios";

const { t } = useI18n();

const showDeleteConfirm=ref(false)
const deletingPdfId=ref<string|number|null>(null)

const openDeleteConfirm=(id:string|number)=>{
  deletingPdfId.value=id
  showDeleteConfirm.value=true
}

const confirmDelete = () =>{
  if (!deletingPdfId.value) return
  emit("remove",deletingPdfId.value)
    showDeleteConfirm.value = false;
  deletingPdfId.value = null;
}

const props = withDefaults(
  defineProps<{
    pdfs?: NotePdf[];
    readonly?:boolean
  }>(),
  {
    pdfs: () => [],
    readonly:false
  },
);

const emit = defineEmits<{
  (e: "attach", value: NotePdf[]): void;
  (e: "remove", id: string | number): void;
  (e: "preview", pdf: NotePdf): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);


const openFilePicker = () => {
  fileInput.value?.click();
};


const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files ?? []);

  if (!files.length) return;

  const validFiles = files.filter((file) => file.type === "application/pdf");

  if (!validFiles.length) {
    target.value = "";
    return;
  }

  const newPdfs: NotePdf[] = [];

  for (const file of validFiles) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      newPdfs.push({
        id: crypto.randomUUID(),
        name: response.data.name,
        url: response.data.url, // "/uploads/whatever.pdf"
      });
    } catch (error) {
      console.error("Upload error:", error);
    }
  }

  if (newPdfs.length > 0) {
    emit("attach", [...props.pdfs, ...newPdfs]);
  }
  
  target.value = "";
};
</script>

<style scoped>
.hidden-input {
  display: none;
}

.pdf-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pdf-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 10px;
}

.pdf-name {
  flex: 1;
  overflow-wrap: anywhere;
  word-break: break-word;
}
</style>
