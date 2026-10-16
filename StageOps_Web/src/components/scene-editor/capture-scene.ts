interface FrameComposer {
  render(delta?: number): void
}
export function captureScenePng<TScene, TCamera>(
  renderer: {
    render(scene: TScene, camera: TCamera): unknown
    domElement: { toDataURL(type: string): string }
  },
  scene: TScene,
  camera: TCamera,
  composer: FrameComposer | null,
): string {
  // Use the same final rendering pipeline as the viewport, then read synchronously.
  if (composer) composer.render(0)
  else renderer.render(scene, camera)
  return renderer.domElement.toDataURL('image/png')
}
