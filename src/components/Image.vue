<template>
  <div class="Image">
    <div class="Image__controls">
      <button v-if="!error" @click="rotateBy(-1)">↶</button>
      <button v-if="!error" @click="rotateBy(1)">↷</button>
      {{ image && loading ? 'Loading...' : '' }}
      {{ error || '' }}
    </div>
    <canvas v-if="image" ref="canvas" class="Image__canvas" :width="width" :height="height"></canvas>
    <img v-else ref="image" class="Image__canvas" :src="this.src" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      rotate: 0,
      zoom: 1,
      origin: 0,
      loading: true,
      image: null,
      error: null,
      height: 0
    }
  },
  props: ['assetId', 'width'],
  computed: {
    src() {
      return `http://www.nhm.ac.uk/services/media-store/asset/${this.assetId}/contents/preview`
    },
    ctx() {
      const canvas = this.$refs.canvas;
      return canvas && canvas.getContext('2d');
    }
  },
  methods: {
    rotateBy(d) {
      while (d < 0) {
        d += 4;
      }
      this.rotate = (this.rotate + d) % 4;
    },
    loadImage() {
      this.loading = true;
      this.error = null;
      const image = this.$refs.image || new Image;
      this.image = image;
      image.src = this.src;
      image.onload = () => {
        this.loading = false;
        this.draw();
      }
      image.onerror = () => {
        this.loading = false;
        this.error = 'Could not load the image, please try again later.';
      }
    },
    draw() {
      const canvas = this.$refs.canvas;
      const ctx = this.ctx;
      const image = this.image;
      const imageSize = Math.max(image.width, image.height);
      const canvasSize = canvas.width;
      const scale = canvasSize / imageSize;
      const w = scale * image.width;
      const h = scale * image.height;
      const rotations = this.rotate;
      const θ = rotations * Math.PI / 2;

      this.height = rotations % 2 ? w : h;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      ctx.rotate(θ);

      const xCentre = (canvas.width - w)/2;
      const yCentre = (canvas.width - h)/2;

      switch (rotations) {
        case 0:
          ctx.translate(xCentre, 0);
          break;
        case 1:
          ctx.translate(0, -(yCentre + h));
          break;
        case 2:
          ctx.translate(-(xCentre +  w), -h);
          break;
        case 3:
          ctx.translate(-w, yCentre);
          break;
      }

      ctx.drawImage(image, 0, 0,  w, h);
      ctx.restore();
    }
  },
  mounted() {
    this.loadImage();
  },
  updated() {
    this.draw();
  },
  watch: {
    rotate(val) {
      this.draw();
    },
    assetId() {
      this.loadImage();
    }
  }
}
</script>

<style>
.Image {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
}

.Image__controls {
  position: sticky;
  top: 0;
}
</style>
