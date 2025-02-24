    folder
      .addColor(data, "sheenColor")
      .onChange(handleColorChange(material.sheenColor));
    folder.add(material, "clearcoat", 0, 1).step(0.01);
    folder.add(material, "clearcoatRoughness", 0, 1).step(0.01);
    folder.add(material, "specularIntensity", 0, 1);
    folder
      .addColor(data, "specularColor")
      .onChange(handleColorChange(material.specularColor));
    folder
      .add(material, "flatShading")
      .onChange(needsUpdate(material, geometry));
    folder.add(material, "wireframe");
    folder
      .add(material, "vertexColors")
      .onChange(needsUpdate(material, geometry));
    folder.add(material, "fog").onChange(needsUpdate(material, geometry));
    folder
      .add(data, "envMaps", envMapKeysPBR)
      .onChange(updateTexture(material, "envMap", envMaps));
    folder
      .add(data, "map", diffuseMapKeys)
      .onChange(updateTexture(material, "map", diffuseMaps));
    folder
      .add(data, "roughnessMap", roughnessMapKeys)
      .onChange(updateTexture(material, "roughnessMap", roughnessMaps));
    folder
      .add(data, "alphaMap", alphaMapKeys)
      .onChange(updateTexture(material, "alphaMap", alphaMaps));
    folder
      .add(data, "metalnessMap", alphaMapKeys)
      .onChange(updateTexture(material, "metalnessMap", alphaMaps));
    folder
      .add(data, "iridescenceMap", alphaMapKeys)
      .onChange(updateTexture(material, "iridescenceMap", alphaMaps));