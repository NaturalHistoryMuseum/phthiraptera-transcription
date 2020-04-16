<template>
  <div class="Transcription">
    <template v-if="records">
      <div class="Transcription__controls">
        <span v-if="multiple">Slide #{{ selected+1 }}</span>
        <button @click="rotate(-1)">↶</button>
        <button @click="rotate(1)">↷</button>
        <button @click="zoom(-1)">-</button>
        <button @click="zoom(1)">+</button>
        <button @click="resetImages">{{ multiple ? 'Reset all' : 'Reset' }}</button>
        <details class="Transcription__info">
          <summary>Mouse controls</summary>
          Pan by dragging, zoom with the scroll wheel, rotate with double-click ( + shift for opposite direction).
        </details>
      </div>
      <div class="Transcription__images" :style="gridStyle">
        <TImage
          ref="images"
          v-for="asset, ix in records.assets"
          :key="asset.asset_id"
          :assetId="asset.asset_id"
          @focus="selected = ix"
          @click="$event.target.focus()"
          :class="imgClass(ix)"
          :tabindex="tabindex"
          @thumbnail="saveThumbnail(ix, $event)"></TImage>
      </div>
      <Form class="Transcription__form"
        :token="records.token"
        :error="error"
        :scientificName="records.scientificName"
        :collections="collections"
        :values="records.fields"
        :barcodes="records.assets.map(r => r.barcode)"
        :action="action"
        :email="email"
        :thumbnails="thumbnails"></Form>
    </template>
    <div v-else class="Transcription__finished">
      <h2>All records have been processed</h2>
      <p>There are no more images to transcribe at this time.</p>
    </div>
  </div>
</template>

<script>
import Form from './Form.vue';
import TImage from './Image.vue';

export default {
  components: {
    Form,
    TImage
  },
  data() {
    return {
      selected: 0,
      thumbnails: []
    }
  },
  props: ['records', 'error', 'collections', 'action', 'email'],
  computed: {
    /**
     * Get the grid size style for the current number of assets
     */
    gridStyle() {
      if(!this.multiple) {
        return null;
      }

      const n = this.records.assets.length;
      const rows = Math.floor(Math.sqrt(n))
      const cols = Math.ceil(n/rows);

      // Set the number of rows and columns based on number of records
      return {
        'grid-template-rows': `repeat(${rows}, 1fr)`,
        'grid-template-columns': `repeat(${cols}, 1fr)`
      };
    },
    /**
     * True if there are multiple images
     */
    multiple() {
      return this.records.assets.length > 1;
    },
    /**
     * Set the tab index if there are multiple images
     */
    tabindex() {
      return this.multiple ? 0 : null;
    },
    /**
     * Get actual the selected index
     */
    selectedIndex(){
      // Bound latent selected index by actual number of assets
      return Math.min(this.selected, this.records.assets.length-1);
    }
  },
  methods: {
    saveThumbnail(index, dataUrl){
      this.thumbnails.length = this.records.assets.length;
      this.thumbnails.splice(index, 1, dataUrl);
    },
    /**
     * Reset the position of all images
     */
    resetImages(){
      for(let image of this.$refs.images) {
        image.reset();
      }
    },
    /*
     * Get the class(es) for the `ix`th image
     */
    imgClass(ix) {
      const selected = this.multiple && this.selectedIndex == ix;

      return {
        'Transcription__image': true,
        'Transcription__image--focusable': this.multiple,
        'Transcription__image--selected': selected
      }
    },
    /**
     * Rotate the selected image by n quarter-turns
     */
    rotate(n){
      this.$refs.images[this.selectedIndex].rotate(n);
    },
    /**
     * Zoom the selected image by n quarter-turns
     */
    zoom(n){
      this.$refs.images[this.selectedIndex].zoom(n);
    }
  }
}
</script>

<style>
.Transcription {
  min-height: 0;
  display: grid;
  grid-auto-flow: column;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "info form"
    "imgs form";
}

.Transcription__controls {
  display: flex;
  align-items: center;
}

.Transcription__controls > * {
  margin: 2px;
  flex-shrink: 0;
}

.Transcription__info {
  font-size: smaller;
  flex-shrink: 1;
  margin-left: 20px;
}

.Transcription__images {
  display: grid;
  align-items: center;
  justify-items: center;
}

.Transcription__images > * {
  max-width: 100%;
  max-height: 100%;
}

.Transcription__image--selected {
  outline: 5px solid white;
  box-shadow: 0 0 5px 7px #66F;
  z-index: 1;
}

.Transcription__image--focusable:focus {
  box-shadow: 0 0 5px 7px #33F;
}

.Transcription__finished {
  max-width: 500px;
  padding: 0 20px;
  margin: auto;
}

.Transcription__form {
  grid-area: form;
}

@media(orientation: portrait) {
  .Transcription {
    flex-direction: column;
  }

  .Transcription__wrapper {
    border-bottom: 1px solid black;
  }
}
</style>
