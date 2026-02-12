#include <jni.h>
#include "NitroPlatformComponentsOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM* vm, void*) {
  return margelo::nitro::nitroplatformcomponents::initialize(vm);
}
