<template>
  <div class="Transcription">
    <div ref="images" class="Transcription__wrapper">
      <div class="Transcription__images" >
        <TImage v-for="record in records" :assetId="record.asset_id" :key="record.asset_id" :width="width" />
      </div>
    </div>
    <Form :barcode="records[0].barcode" :error="error"/>
  </div>
</template>

<script>
import ResizeObserver from 'resize-observer-polyfill';
import Form from './Form.vue';
import TImage from './Image.vue';

export default {
  components: {
    Form,
    TImage
  },
  data() {
    return {
      imageSetWidth: 0,
      imageSetHeight: 0
    }
  },
  props: ['records', 'error'],
  computed: {
    width() {
      const n = this.records.length;
      const h = this.imageSetHeight;
      const w = this.imageSetWidth;

      let hyp = Infinity;
      let width, height;

      // Find the different permutations of grids n*1 => 1*n.
      for(let x = n; x > 0; x--) {
        // Find cell width/height for grid of `x` cells wide by `⌈x/n⌉` cells high.
        const imgWidth_ = Math.floor(w / x);
        const imgHeight_ = Math.floor(h / Math.ceil(n/x));
        const hyp_ = Math.hypot(imgWidth_, imgHeight_);

        // Grid cells with smaller hypotenuses are more
        // space-efficient for square contents.
        if (hyp_ < hyp) {
          [hyp, width, height] = [hyp_, imgWidth_, imgHeight_]
        }
      }

      return width;
    }
  },
  mounted() {
    const resizeObserver = new ResizeObserver(() => {
      this.imageSetWidth = this.$refs.images.clientWidth - 5;
      this.imageSetHeight = this.$refs.images.clientHeight - 5;
    });
    resizeObserver.observe(this.$el);
    // NB: As of 2018-06-05 the spec doesn't define whether resizeObserver is
    // garbage collected when $el is removed from DOM. Current Chrome behaviour
    // is that it does. If this changes, use unobserve/disconnect on unmount.
  }
}
</script>

<style>
.Transcription {
  min-height: 0;
  display: flex;
}

.Transcription > * {
  flex: 1 1 50%;
}

.Transcription__images {
  display: flex;
  flex-wrap: wrap;
}

.Transcription__wrapper {
  overflow: auto;
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
