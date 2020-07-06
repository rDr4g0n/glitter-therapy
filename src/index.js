import { scaleLinear } from "d3-scale";

const getGetPxIdx = w => (x, y) => {
  var r = y * (w * 4) + x * 4;
  return [r, r + 1, r + 2, r + 3];
}

const rand8 = () => Math.floor(Math.random() * 255)

class THERAPY {
  constructor(el){
    this.el = document.getElementById("content");
    this.ctx = this.el.getContext("2d");
    this.measureCanvas();
    this.xScale = scaleLinear().range([0, this.w]);
    this.yScale = scaleLinear().range([0, this.h]);

    this.sprinkleGlitter();
    this.setupLights();

    if(false){
      // start render loop
      const doRender = function(){
        this.render();
        window.requestAnimationFrame(doRender);
      }.bind(this);
      doRender();
    } else {
      this.render();
    }
  }

  measureCanvas(){
    const { width, height } = this.el.getBoundingClientRect();
    this.w = width;
    this.el.width = width;
    this.h = height;
    this.el.height = height;
    this.getPxIdx = getGetPxIdx(width);
  }

  sprinkleGlitter(){
    // TODO - parameterize
    this.glitter = new Array(1000).fill().map(i => {
      return {
        x: Math.floor(this.xScale(Math.random())),
        y: Math.floor(this.yScale(Math.random())),
        angleX: Math.floor(Math.random() * 10) - 5,
        angleY: Math.floor(Math.random() * 10) - 5,
        color: [rand8(), rand8(), rand8(), 255]
      }
    });
    this.reflections = this.glitter.map(() => [0, 0, 0, 255]);
  }

  setupLights(){
    // make a light which follows mouse
    const light = {
      x: 0,
      y: 0,
    };
    window.addEventListener("mousemove", (e) => {
      light.x = e.clientX;
      light.y = e.clientY;
    });
    this.lights = [light];
  }

  render(){
    this.illuminate();
    this.drawr();
  }
  
  illuminate(){
    // TODO - compute color values for each glitter particle
    this.reflections = this.glitter.map(({ color }) => {
      return Math.random() > 0.5 ? color : [0, 0, 0, 255];
    });
  }

  drawr(){
    // bg
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.w, this.h);

    // light
    const light = this.lights[0]
    const lightDiameter = 400;
    const gradient = this.ctx.createRadialGradient(
      light.x, light.y, 50,
      light.x, light.y, lightDiameter / 2
    );
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(
      light.x - (lightDiameter / 2),
      light.y - (lightDiameter / 2),
      lightDiameter,
      lightDiameter
    );
    
    const image = this.ctx.getImageData(0, 0, this.w, this.h);
    // bunch o dots
    this.glitter.forEach(({ x, y }, i) => {
      const [ r, g, b, a ] = this.getPxIdx(x, y);
      const reflectedColor = this.reflections[i];
      image.data[r] = reflectedColor[0];
      image.data[g] = reflectedColor[1];
      image.data[b] = reflectedColor[2];
      image.data[a] = reflectedColor[3];
    });

    // TODO - glow around dots of max intensity?
    this.ctx.putImageData(image, 0, 0);
  }
}

// glitter
// - size
// - shape/image
// - color fn (angle = color)
// density
// angle generator (min, max, distribution)

const t = new THERAPY();
window.t = t;
