export function flatMeshToSingleArray(mesh) {
  return Object.values(mesh)
    .map((e) => Object.values(e))
    .flat();
}
