#include <common>
#include <packing>

uniform sampler2D depthBuffer;

uniform float focusDistance;
uniform float focalLength;
uniform float cameraNear;
uniform float cameraFar;

varying vec2 vUv;

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		return unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		return texture2D(depthBuffer, uv).r;

	#endif

}

float getViewZ(const in float depth) {

	#ifdef PERSPECTIVE_CAMERA

		return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);

	#else

		return orthographicDepthToViewZ(depth, cameraNear, cameraFar);

	#endif

}

void main() {

	float depth = readDepth(vUv);

	#ifdef PERSPECTIVE_CAMERA

		float linearDepth = viewZToOrthographicDepth(getViewZ(depth), cameraNear, cameraFar);

	#else

		float linearDepth = depth;

	#endif

	float signedDistance = linearDepth - focusDistance;
	float magnitude = smoothstep(0.0, focalLength, abs(signedDistance));

	gl_FragColor.rg = vec2(
		step(signedDistance, 0.0) * magnitude,
		step(0.0, signedDistance) * magnitude
	);

}
