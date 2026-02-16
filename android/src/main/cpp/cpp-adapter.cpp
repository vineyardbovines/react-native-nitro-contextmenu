#include <jni.h>
#include "NitroContextMenuOnLoad.hpp"

JNIEXPORT jint JNICALL JNI_OnLoad(JavaVM *vm, void *)
{
  return margelo::nitro::nitrocontextmenu::initialize(vm);
}
