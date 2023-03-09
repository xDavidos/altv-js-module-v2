#include "Class.h"
#include "interfaces/IResource.h"

void js::Class::Register(v8::Isolate* isolate)
{
    ClassTemplate tpl{ isolate,
                       this,
                       ctor ? WrapFunction(ctor) : v8::FunctionTemplate::New(isolate, nullptr, v8::Local<v8::Value>(), v8::Local<v8::Signature>(), 0, v8::ConstructorBehavior::kThrow) };
    if(parentClass)
    {
        if(!parentClass->templateMap.contains(isolate)) parentClass->Register(isolate);
        tpl.Get()->Inherit(parentClass->templateMap.at(isolate).Get());
    }
    initCb(tpl);
    tpl.Get()->SetClassName(js::JSValue(name));
    tpl.Get()->InstanceTemplate()->SetInternalFieldCount(internalFieldCount);
    templateMap.insert({ isolate, tpl });
}

void js::Class::Initialize(v8::Isolate* isolate)
{
    for(auto class_ : GetAll())
    {
        class_->Register(isolate);
    }
    ClassTemplate::CleanupPropertyGetterMap(isolate);  // Only needed while setting up the templates, so we can free the data here
}

void js::Class::Cleanup(v8::Isolate* isolate)
{
    for(auto class_ : GetAll())
    {
        class_->templateMap.erase(isolate);
    }
    ClassTemplate::CleanupDynamicPropertyData(isolate);
}
