<template>
  <div class="Image">
    <div>
      <button @click="rotateBy(-1)">&lt;-</button>
      <button @click="rotateBy(1)">-></button>
      {{ loading ? 'Loading...' : '' }}
    </div>
    <canvas ref="canvas" class="Image__canvas"></canvas>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rotate: 0,
      zoom: 1,
      origin: 0,
      ctx: null,
      loading: true
    }
  },
  props: ['src'],
  methods: {
    rotateBy(d) {
      while (d < 0) {
        d += 4;
      }
      this.rotate = (this.rotate + d) % 4;
    },
    loadImage() {
      this.loading = true;
      const image = new Image;
      this.image = image;
      image.src = 'http://www.nhm.ac.uk/services/media-store/asset/' + this.src + '/contents/preview';
      image.onload = () => {
        this.loading = false;
        const canvas = this.$refs.canvas;
        const ctx = canvas.getContext('2d');
        this.ctx = ctx;
        this.draw();
      }
    },
    draw() {
      const canvas = this.$refs.canvas;
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const ctx = this.ctx;
      const image = this.image;
      const w = canvas.width;
      const h = w * image.height / image.width;
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
    src() {
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
  flex: 1;
}
</style>
