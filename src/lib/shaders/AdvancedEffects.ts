export const portalVertexShader = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vPosition = position;
        
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;
        
        gl_Position = projectedPosition;
    }
`;

export const portalFragmentShader = `
    uniform float time;
    uniform vec3 portalColor;
    uniform sampler2D noiseTexture;
    
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vec2 distortedUv = vUv;
        distortedUv.x += sin(distortedUv.y * 10.0 + time) * 0.1;
        distortedUv.y += cos(distortedUv.x * 10.0 + time) * 0.1;
        
        vec4 noise = texture2D(noiseTexture, distortedUv);
        
        float fresnel = pow(1.0 + dot(vNormal, normalize(vPosition)), 3.0);
        
        vec3 color = mix(portalColor, vec3(1.0), fresnel);
        color += noise.rgb * 0.5;
        
        gl_FragColor = vec4(color, 1.0);
    }
`;
