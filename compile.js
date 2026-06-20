const { Compiler } = require('mind-ar/src/image-target/compiler.js');
const fs = require('fs');
const { PNG } = require('pngjs');

async function run() {
  try {
    console.log("Loading PNG...");
    const data = fs.readFileSync('public/marker.png');
    const png = PNG.sync.read(data);
    
    const imageData = {
      data: new Uint8ClampedArray(png.data),
      width: png.width,
      height: png.height
    };

    console.log("Compiling...");
    const compiler = new Compiler();
    const dataList = await compiler.compileImageTargets([imageData], (progress) => {
      console.log('Progress: ' + progress.toFixed(2));
    });
    
    const buffer = compiler.exportData();
    fs.writeFileSync('public/targets.mind', Buffer.from(buffer));
    console.log("Done! targets.mind generated.");
  } catch (e) {
    console.error(e);
  }
}
run();
