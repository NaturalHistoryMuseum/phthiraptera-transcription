<template>
  <img
    :class="{
      Image: true,
      'Image--loading': loading,
      'Image--error': error
    }"
    :src="src"
    ref="image"
    :alt="error || ''"
    v-on="$listeners"
    @load="loadEnd"
    @error="error = 'The image could not be loaded, there may be network or infrastructure issues.'"
    @dblclick="rotate($event.shiftKey ? -1 : 1)"
    @wheel="zoomWithWheel"
    :style="{ transform }" />
</template>

<script>
export default {
  data() {
    return {
      loading: true,
      error: null,
      scale: 1,
      x: 0,
      y: 0,
      turns: 0
    }
  },
  props: ['assetId'],
  computed: {
    /**
     * Get the source URL of the asset
     */
    src() {
      return `/asset/${this.assetId}`
    },
    /**
     * Get the css transformation for this image
     */
    transform(){
      // We add rotate onto the end, as it's not provided by panzoom
      return `scale(${this.scale}) translate(${this.x}px, ${this.y}px) rotate(${this.turns/4}turn)`;
    }
  },
  methods: {
    /**
     * Reset the transformations to default
     */
    reset() {
      this.panzoom.reset();
      this.turns = 0;
    },
    /**
     * Rotate the image `count/4` turns clockwise
     */
    rotate(count = 1){
      this.turns += count;
    },
    /**
     * Zoom the image in by `n` steps
     */
    zoom(n = 1){
      // A whole step is a bit too big so scale it down
      this.panzoom.zoomIn({ step: 0.3 * n });
    },
    /**
     * Set the loading indicator and clear the error
     */
    loadImage() {
      this.loading = true;
      this.error = null;
    },
    /**
     * Zoom in/out based on a wheel event
     */
    zoomWithWheel(event) {
      const image = event.target;

      // Panzoom doesn't handle images in grids correctly,
      // it doesn't check their offsets so the zoom focal
      // point is wrong. We need to wrap the event in a proxy
      // so we can assign the correct clientX/Y and also
      // let it call event.preventDefault.
      const handler = {
        get(obj, prop){
          switch(prop){
            case 'clientY':
              return obj.clientY - image.y;
            case 'clientX':
              return obj.clientX - image.x;
            case 'preventDefault':
              return () => obj.preventDefault()
            default:
              return obj[prop];
          }
        }
      }

      const e = new Proxy(event, handler);

      this.panzoom.zoomWithWheel(e);
    },

    toDataThumbnail(size=200, quality=0.4){
      const img = this.$el;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const scale = size/Math.max(img.naturalWidth, img.naturalHeight);
      const width = img.naturalWidth * scale;
      const height = img.naturalHeight * scale;
      canvas.getContext('2d').drawImage(img, (size-width)/2, (size-height)/2, width, height)
      return canvas.toDataURL('image/jpg', quality);
    },

    loadEnd(){
      this.loading = false;

      this.$emit('thumbnail', this.toDataThumbnail());
    }
  },
  async mounted() {
    // Get the panzoom (use async import or this component throws on SSR)
    const { default: Panzoom } = await import('@panzoom/panzoom');

    // Set up the panzoom tool
    const panzoom = new Panzoom(this.$refs.image, {
      setTransform: (elem, { scale, x, y }) => {
        // Instead of directly setting the values on the element,
        // save them to the VM so we can integrate with Vue better.
        this.x = x;
        this.y = y;
        this.scale = scale;
      },
      // No max scale
      maxScale: Infinity
    });
    // Reference the panzoom controller so we can use this later.
    // This object should last the lifetime of the component so it doesn't
    // have to be reactive.
    this.panzoom = panzoom;
  },
  watch: {
    assetId() {
      // When the assetId changes the new image will start loading,
      // so enable the loading indicator.
      this.loadImage();
    }
  }
}
</script>

<style>
.Image {
  /* Override panzoom's transition style for a nicer experience  */
  transition: transform 0.1s ease 0s !important;
}

.Image--loading {
  background: url('./ajax-loader.gif') center no-repeat;
  min-height: 50px;
  min-width: 50px;
}

.Image--error {
  background: url('./alert-triangle.svg') center no-repeat;
  min-height: 100px;
  min-width: 50px;

  /* Style the alt-text (the error message) */
  font-weight: bold;
}
</style>
