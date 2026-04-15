<template>
  <div class="pdf-viewer">
    <div class="toolbar">
      <q-btn flat dense label="-" @click="zoomOut" :disable="scale <= 0.6" />
      <span>% {{ Math.round(scale * 100) }}</span>
      <q-btn flat dense label="+" @click="zoomIn" />

      <q-btn flat dense label="ÖNCEKİ" @click="prevPage" :disable="pageNum <= 1" />
      <span>Sayfa {{ pageNum }} / {{ totalPages }}</span>
      <q-btn flat dense label="SONRAKİ" @click="nextPage" :disable="pageNum >= totalPages" />
      <q-btn flat padding="2px" icon="download" @click="downloadPdf" />
      <q-space />

      
    </div>

    <div class="canvas-wrapper">
      <canvas ref="canvasRef"></canvas>

      <div v-if="loading" class="overlay-message">
        PDF yükleniyor...
      </div>

      <div v-else-if="errorMessage" class="overlay-message error-box">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick,shallowRef } from "vue";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const props = defineProps<{
  pdfData: string;
  fileName?: string;
  visible?: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const pdfDoc = shallowRef<any>(null);
const pageNum = ref(1);
const totalPages = ref(0);
const scale = ref(0.8);
const loading = ref(false);
const errorMessage = ref("");

const dataUrlToUint8Array = (value: string): Uint8Array => {
  const base64 = value.includes(",") ? value.split(",")[1] : value;

  if (!base64) {
    throw new Error("Geçersiz PDF verisi");
  }

  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
};

const uint8ArrayToBlob = (bytes: Uint8Array): Blob => {
  const arrayBuffer = new Uint8Array(bytes).buffer;
  return new Blob([arrayBuffer], { type: "application/pdf" });
};

const renderPage = async () => {
  if (!pdfDoc.value || !canvasRef.value) return;

  const page = await pdfDoc.value.getPage(pageNum.value);
  const viewport = page.getViewport({ scale: scale.value });

  const canvas = canvasRef.value;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context alınamadı");
  }

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
};

const loadPdf = async () => {
  if (!props.pdfData) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const pdfBytes = dataUrlToUint8Array(props.pdfData);
    const loadingTask = getDocument({ data: pdfBytes });
    pdfDoc.value = await loadingTask.promise;

    totalPages.value = pdfDoc.value.numPages;
    pageNum.value = 1;

    await nextTick();
    await new Promise((resolve) => requestAnimationFrame(() => resolve(true)));
    await renderPage();
  } catch (error) {
    console.error("PDF yüklenemedi:", error);
    errorMessage.value = "PDF görüntülenemedi.";
  } finally {
    loading.value = false;
  }
};

const rerenderCurrentPage = async () => {
  await nextTick();
  await new Promise((resolve) => requestAnimationFrame(() => resolve(true)));
  await renderPage();
};

const prevPage = async () => {
  if (pageNum.value <= 1) return;
  pageNum.value--;
  await rerenderCurrentPage();
};

const nextPage = async () => {
  if (pageNum.value >= totalPages.value) return;
  pageNum.value++;
  await rerenderCurrentPage();
};

const zoomIn = async () => {
  scale.value += 0.2;
  await rerenderCurrentPage();
};

const zoomOut = async () => {
  if (scale.value <= 0.6) return;
  scale.value -= 0.2;
  await rerenderCurrentPage();
};

const downloadPdf = () => {
  try {
    const bytes = dataUrlToUint8Array(props.pdfData);
    const blob = uint8ArrayToBlob(bytes);
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = props.fileName || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("PDF indirilemedi:", error);
  }
};

watch(
  () => props.pdfData,
  async (newValue) => {
    if (!newValue) return;
    if (props.visible === false) return;
    await loadPdf();
  },
  { immediate: true }
);

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return;
    if (!props.pdfData) return;

    if (!pdfDoc.value) {
      await loadPdf();
    } else {
      await rerenderCurrentPage();
    }
  }
);
</script>

<style scoped>
.pdf-viewer {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  flex-shrink: 0;
}

.canvas-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: auto;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  
}

canvas {
  display: block;
  margin: 0 auto;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.overlay-message {
  position: absolute;
  inset: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(250, 250, 250, 0.85);
  border-radius: 6px;
}

.error-box {
  color: #c62828;
}
</style>