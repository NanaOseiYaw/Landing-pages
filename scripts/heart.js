var canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var gl = canvas.getContext("webgl");
if (!gl) {
  console.error("WebGL not supported");
}

var time = 0.0;

//***** ** SHADERS *****

var vertexShaderSource = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

var fragmentShaderSource = `
precision highhp float;

uniform float width;
uniform float height;
vec2 resolution = vec2(width, height);

uniform float time;

vec2 points[POINTS_COUNT];
const float speed = 0.5;
const float len = 0.25;
float intensity = 1.5;
float radius = 0.008;

//https://www.shadertoy.com/view/MlKcDD

float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C){    
    vec2 a = B - A;
    vec2 b = A - 2.0*B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    float kk = 1.0 / dot(b,b);
    float kx = kk * dot(a,b);
    float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
    float kz = kk * dot(d,a);      
    float res = 0.0;
    float p = ky - kx*kx;
    float p3 = p*p*p;
    float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
    float h = q*q + 4.0*p3;
    if(h >= 0.0){ 
        h = sqrt(h);
        vec2 x = (vec2(h, -h) - q) / 2.0;
        vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
        float t = uv.x + uv.y - kx;
        t = clamp( t, 0.0, 1.0 );
        // 1 root
        vec2 qos = d + (c + b*t)*t;
        res = length(qos);
    }else{
        float z = sqrt(-p);
        float v = acos( q/(p*z*2.0) ) / 3.0;
        float m = cos(v);
        float n = sin(v)*1.732050808;
        vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
        t = clamp( t, 0.0, 1.0 );
        // 3 roots
        vec2 qos = d + (c + b*t.x)*t.x;
        float dis = dot(qos,qos);
        
        res = dis;
        qos = d + (c + b*t.y)*t.y;
        dis = dot(qos,qos);
        res = min(res,dis);
        
        qos = d + (c + b*t.z)*t.z;
        dis = dot(qos,qos);
        res = min(res,dis);
        res = sqrt( res );
    }
    
    return res;
}

//http://mathworld.wolfram.com/HeartCurve.html
vec2 getHeartPosition(float t){
    return vec2(16.0 * sin(t) * sin(t) * sin(t),
                            -(13.0 * cos(t) - 5.0 * cos(2.0*t)
                            - 2.0 * cos(3.0*t) - cos(4.0*t)));
}

//https://www.shadertoy.com/view/3s3GDn
float getGlow(float distance, float radius, float intensity){
    return pow(distance / radius, intensity);
}

float getSegment(float t, vec2 pos, float offset, float scale){
    for(int i = 0; i < POINTS_COUNT; i++){
    points[i] = getHeartPosition(offset + float(i)*len + fract(speed *t) * 6.28);
}

    vec2 c= (points[0] + points [1]) / 2.0;
    vec2 c_prev;
    float distance = 10000.0;

    for(int i = 0; i < POINTS_COUNT - 1; i++){
        c_prev = c;
        c = (points[i] + points[i + 1]) / 2.0;
        distance = min(distance, sdBezier(pos, scale * points[i], scale * c_prev, scale * c));
    }
        return max(0.0, distance);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    float widthHeightRatio = resolution.x / resolution.y;
    vec2 centre = vec2(0.5, 0.5);
    vec2 pos = uv - centre;
    pos.y /y= widthHeightRatio;
    pos.y += 0.02;
    float scale = 0.0000015 * height;
    float t = time;
    
}
`;