<template>
  <div class="Image">
    <div>
      <button @click="rotateBy(-1)">&lt;-</button>
      <button @click="rotateBy(1)">-></button>
      {{ image && loading ? 'Loading...' : '' }}
    </div>
    <canvas v-if="image" ref="canvas" class="Image__canvas"></canvas>
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
      image: null
    }
  },
  props: ['assetId'],
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
      const image = this.$refs.image || new Image;
      this.image = image;
      image.src = this.src;
      image.onload = () => {
        this.loading = false;
        this.draw();
      }
    },
    draw() {
      const canvas = this.$refs.canvas;
      const ctx = this.ctx;
      const image = this.image;
      const w = canvas.clientWidth;
      const h = w * image.height / image.width;
      canvas.height = h;
      canvas.width = w;
      const n = this.rotate;
      const θ = n * Math.PI / 2;

      ctx.save();
      ctx.rotate(θ);

      switch (n) {
        case 1:
          ctx.translate(0, -(w + h)/2);
          break;
        case 2:
          ctx.translate(-w, -h);
          break;
        case 3:
          ctx.translate(-w, (w - h)/2);
          break;
      }

      ctx.drawImage(image, 0, 0, w, h);
      ctx.restore();
    }
  },
  mounted() {
    this.loadImage()
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
}
.Image__canvas {
  max-width: 100%;
}
</style>
