import { useEffect } from "react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  async function handleWebGPU() {

    const canvas = window.document.querySelector("canvas");
     
      console.log("navigator: ", navigator);
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        throw new Error("No appropriate GPUAdapter found.");
      };

      const device = await adapter.requestDevice();
      const context = canvas?.getContext("webgpu");
      const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device: device,
        format: canvasFormat
      });

      const encoder = device.createCommandEncoder();

      const pass = encoder.beginRenderPass({
        colorAttachments: [{
          view: context.getCurrentTexture().createView(),
          loadOp: "clear",
          storeOp: "store",
          clearValue: {r:0, g:0, b: 0.9, a:1},
        }]
      });
  

     const cellShaderModule = device.createShaderModule({
      label: "Cell shader",
      code: `
        @vertex
        fn vertexMain(@location(0) pos: vec2f) -> 
          @builtin(position) vec4f {
          return vec4f(pos,0,1); // (X, Y, Z, W)
        }
        
        @fragment
        fn fragmentMain() -> @location(0) vec4f {
          return vec4f(1,0,0,1); // (r,g,b,a)  
        }
      `
    });

 /* define the vertex layout */
    const vertexBufferLayout = {
      arrayStride: 8,
    attributes: [{
      format: "float32x2",
        offset: 0,
        shaderLocation: 0, // Position, see vertex shader
      }],
    };
    

     const cellPipeline = device.createRenderPipeline({
      label: "Cell cellPipeline",
      layout: "auto",
      vertex: {
        module: cellShaderModule,
        entryPoint: "vertexMain",
        buffers: [vertexBufferLayout],
      },
      fragment: {
        module: cellShaderModule,
        entryPoint: "fragmentMain",
        targets: [{
          format: canvasFormat
        }]
      }

    });

const vertices = new Float32Array([
      -0.8,-0.8, // triangle 1 
      0.8,-0.8,
      0.8,0.8,

      -0.8,-0.8, // triangle 2
      0.8, 0.8,
      -0.8,0.8,
    ]);

    const vertexBuffer = device.createBuffer({
      label: "Cell vertices",
      size: vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });

     device.queue.writeBuffer(vertexBuffer, /*bufferOffset=*/0, vertices);


       // Draw square
    pass.setPipeline(cellPipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.draw(vertices.length /2 ); // 6 vertices


      pass.end();
      
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    // finish the command buffer and immediately submit it.
    device.queue.submit([encoder.finish()]);

       
   
    // Shaders

   
        };


  useEffect(() => {
    if (typeof window !== undefined) {
      handleWebGPU();
    };

   
  }, [])

  // webGPU code here!!
  
   return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>webGPU app built with Remix framework</h1>
        <canvas width="512" height="512"></canvas>

      </div>
  );
}
