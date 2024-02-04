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
      pass.end();
      
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    // finish the command buffer and immediately submit it.
    device.queue.submit([encoder.finish()]);
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
