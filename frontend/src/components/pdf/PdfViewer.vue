<template>
  <div class="pdf-viewer">
    <div class="toolbar">
      <template v-if="isPdf">
        <q-btn flat dense label="-" @click="zoomOut" :disable="scale <= 0.6" />
        <span>% {{ Math.round(scale * 100) }}</span>
        <q-btn flat dense label="+" @click="zoomIn" />

        <q-btn flat dense label="ÖNCEKİ" @click="prevPage" :disable="pageNum <= 1" />
        <span>Sayfa {{ pageNum }} / {{ totalPages }}</span>
        <q-btn flat dense label="SONRAKİ" @click="nextPage" :disable="pageNum >= totalPages" />
      </template>
      <q-btn flat padding="2px" icon="download" @click="downloadPdf" />
      <q-space />

      
    </div>

    <div class="canvas-wrapper">
      <template v-if="isPdf">
        <canvas ref="canvasRef"></canvas>

        <div v-if="loading" class="overlay-message">
          PDF yükleniyor...
        </div>

        <div v-else-if="errorMessage" class="overlay-message error-box">
          {{ errorMessage }}
        </div>
      </template>
      <template v-else-if="isImage">
        <img :src="fileUrl" class="image-preview" alt="Preview" />
      </template>
      <template v-else-if="isText">
        <pre v-if="!loading && !errorMessage" class="text-preview">{{ textContent }}</pre>
        <div v-if="loading" class="overlay-message">Metin yükleniyor...</div>
        <div v-else-if="errorMessage" class="overlay-message error-box">{{ errorMessage }}</div>
      </template>
      <template v-else>
        <div class="overlay-message">
          Bu dosya formatı önizlenemiyor. <br>
          Lütfen indirme butonunu kullanarak dosyayı indirin.
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, shallowRef, computed } from "vue";
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
const textContent = ref("");

const fileUrl = computed(() => {
  if (!props.pdfData) return "";

  const isBase64 = props.pdfData.startsWith("data:");

  return isBase64
    ? props.pdfData
    : props.pdfData.startsWith("/")
      ? `${import.meta.env.VITE_API_URL.replace("/api", "")}${props.pdfData}`
      : props.pdfData;
});

const isPdf = computed(() => {
  if (!props.pdfData && !props.fileName) return false;
  const nameOrUrl = (props.fileName || props.pdfData || "").toLowerCase();
  return nameOrUrl.endsWith('.pdf') || nameOrUrl.includes('application/pdf') || nameOrUrl.startsWith('data:application/pdf');
});

const isImage = computed(() => {
  if (!props.pdfData && !props.fileName) return false;
  const nameOrUrl = (props.fileName || props.pdfData || "").toLowerCase();
  return nameOrUrl.match(/\.(jpeg|jpg|gif|png|webp|svg|bmp)$/) != null || nameOrUrl.startsWith('data:image/');
});

const isText = computed(() => {
  if (!props.pdfData && !props.fileName) return false;
  const nameOrUrl = (props.fileName || props.pdfData || "").toLowerCase();
  return nameOrUrl.endsWith('.txt') || nameOrUrl.startsWith('data:text/');
});

// Removed legacy base64 convertors

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

const loadText = async () => {
  if (!isText.value || !fileUrl.value) return;
  loading.value = true;
  errorMessage.value = "";
  try {
    const response = await fetch(fileUrl.value);
    if (!response.ok) throw new Error("Ağ hatası");
    textContent.value = await response.text();
  } catch (error) {
    errorMessage.value = "Metin dosyası yüklenemedi.";
  } finally {
    loading.value = false;
  }
};

const loadPdf = async () => {
  if (!fileUrl.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const loadingTask = getDocument(fileUrl.value);
    pdfDoc.value = await loadingTask.promise;

    totalPages.value = pdfDoc.value.numPages;
    pageNum.value = 1;

    await nextTick(); //reaktif state değişikliklerinden sonra DOM güncellenmesini beklemek için
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
    const a = document.createElement("a");
    a.href = fileUrl.value;
    a.download = props.fileName || "document";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Dosya indirilemedi:", error);
  }
};

watch(
  () => props.pdfData,
  async (newValue) => {
    if (!newValue) return;
    if (props.visible === false) return;
    if (isPdf.value) {
      await loadPdf();
    } else if (isText.value) {
      await loadText();
    }
  },
  { immediate: true }
);

watch(
  () => props.visible,
  async (isVisible) => {
    if (!isVisible) return;
    if (!props.pdfData) return;

    if (isPdf.value) {
      if (!pdfDoc.value) {
        await loadPdf();
      } else {
        await rerenderCurrentPage();
      }
    } else if (isText.value) {
      if (!textContent.value) {
        await loadText();
      }
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

.image-preview {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.text-preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: inherit;
}
</style>