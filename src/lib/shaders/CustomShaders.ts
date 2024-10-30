export const fluidVertexShader = `
    attribute vec3 velocity;
    uniform float time;
    
    varying vec3 vVelocity;
    
    void main() {
        vVelocity = velocity;
        vec3 pos = position + velocity * time;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = 2.0;
    }
`;

export const fluidFragmentShader = `
    varying vec3 vVelocity;
    
    void main() {
        float speed = length(vVelocity);
        vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(1.0, 0.0, 0.0), speed);
        gl_FragColor = vec4(color, 1.0);
    }
`;
