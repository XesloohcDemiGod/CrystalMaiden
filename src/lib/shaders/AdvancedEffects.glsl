// Vertex Shader
varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}

// Fragment Shader
uniform float time;
uniform vec3 color;
uniform sampler2D normalMap;
uniform sampler2D environmentMap;
uniform float roughness;
uniform float metalness;

varying vec3 vNormal;
varying vec2 vUv;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

void main() {
    // Normal mapping
    vec3 normal = normalize(vNormal);
    vec3 normalMap = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    normal = normalize(normal + normalMap);

    // Environment mapping
    vec3 viewDir = normalize(vViewPosition);
    vec3 reflectDir = reflect(-viewDir, normal);
    vec3 envColor = textureCube(environmentMap, reflectDir).rgb;

    // PBR calculations
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float NdotL = max(dot(normal, lightDir), 0.0);
    
    // Fresnel effect
    float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    
    // Final color composition
    vec3 finalColor = mix(color, envColor, fresnel * metalness);
    finalColor *= NdotL;
    finalColor += envColor * roughness;
    
    gl_FragColor = vec4(finalColor, 1.0);
} 