// This file was auto-generated by the veyron vdl tool.
// Source: smokedetector.vdl

package sample

import (
	// The non-user imports are prefixed with "__" to prevent collisions.
	__veyron2 "veyron.io/veyron/veyron2"
	__context "veyron.io/veyron/veyron2/context"
	__ipc "veyron.io/veyron/veyron2/ipc"
	__vdlutil "veyron.io/veyron/veyron2/vdl/vdlutil"
	__wiretype "veyron.io/veyron/veyron2/wiretype"
)

// TODO(toddw): Remove this line once the new signature support is done.
// It corrects a bug where __wiretype is unused in VDL pacakges where only
// bootstrap types are used on interfaces.
const _ = __wiretype.TypeIDInvalid

// SmokeDetectorClientMethods is the client interface
// containing SmokeDetector methods.
//
// SmokeDetector allows clients to monitor and adjust a smoke detector.
type SmokeDetectorClientMethods interface {
	// Status retrieves the current status and sensitivity of the SmokeDetector.
	Status(__context.T, ...__ipc.CallOpt) (status string, sensitivity int16, err error)
	// Test the SmokeDetector to check if it is working.
	Test(__context.T, ...__ipc.CallOpt) (bool, error)
	// Sensitivity adjusts the SmokeDetector's sensitivity to smoke.
	Sensitivity(ctx __context.T, sens int16, opts ...__ipc.CallOpt) error
}

// SmokeDetectorClientStub adds universal methods to SmokeDetectorClientMethods.
type SmokeDetectorClientStub interface {
	SmokeDetectorClientMethods
	__ipc.UniversalServiceMethods
}

// SmokeDetectorClient returns a client stub for SmokeDetector.
func SmokeDetectorClient(name string, opts ...__ipc.BindOpt) SmokeDetectorClientStub {
	var client __ipc.Client
	for _, opt := range opts {
		if clientOpt, ok := opt.(__ipc.Client); ok {
			client = clientOpt
		}
	}
	return implSmokeDetectorClientStub{name, client}
}

type implSmokeDetectorClientStub struct {
	name   string
	client __ipc.Client
}

func (c implSmokeDetectorClientStub) c(ctx __context.T) __ipc.Client {
	if c.client != nil {
		return c.client
	}
	return __veyron2.RuntimeFromContext(ctx).Client()
}

func (c implSmokeDetectorClientStub) Status(ctx __context.T, opts ...__ipc.CallOpt) (o0 string, o1 int16, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Status", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &o1, &err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSmokeDetectorClientStub) Test(ctx __context.T, opts ...__ipc.CallOpt) (o0 bool, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Test", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSmokeDetectorClientStub) Sensitivity(ctx __context.T, i0 int16, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Sensitivity", []interface{}{i0}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSmokeDetectorClientStub) Signature(ctx __context.T, opts ...__ipc.CallOpt) (o0 __ipc.ServiceSignature, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Signature", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSmokeDetectorClientStub) GetMethodTags(ctx __context.T, method string, opts ...__ipc.CallOpt) (o0 []interface{}, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "GetMethodTags", []interface{}{method}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

// SmokeDetectorServerMethods is the interface a server writer
// implements for SmokeDetector.
//
// SmokeDetector allows clients to monitor and adjust a smoke detector.
type SmokeDetectorServerMethods interface {
	// Status retrieves the current status and sensitivity of the SmokeDetector.
	Status(__ipc.ServerContext) (status string, sensitivity int16, err error)
	// Test the SmokeDetector to check if it is working.
	Test(__ipc.ServerContext) (bool, error)
	// Sensitivity adjusts the SmokeDetector's sensitivity to smoke.
	Sensitivity(ctx __ipc.ServerContext, sens int16) error
}

// SmokeDetectorServerStubMethods is the server interface containing
// SmokeDetector methods, as expected by ipc.Server.
// There is no difference between this interface and SmokeDetectorServerMethods
// since there are no streaming methods.
type SmokeDetectorServerStubMethods SmokeDetectorServerMethods

// SmokeDetectorServerStub adds universal methods to SmokeDetectorServerStubMethods.
type SmokeDetectorServerStub interface {
	SmokeDetectorServerStubMethods
	// GetMethodTags will be replaced with DescribeInterfaces.
	GetMethodTags(ctx __ipc.ServerContext, method string) ([]interface{}, error)
	// Signature will be replaced with DescribeInterfaces.
	Signature(ctx __ipc.ServerContext) (__ipc.ServiceSignature, error)
}

// SmokeDetectorServer returns a server stub for SmokeDetector.
// It converts an implementation of SmokeDetectorServerMethods into
// an object that may be used by ipc.Server.
func SmokeDetectorServer(impl SmokeDetectorServerMethods) SmokeDetectorServerStub {
	stub := implSmokeDetectorServerStub{
		impl: impl,
	}
	// Initialize GlobState; always check the stub itself first, to handle the
	// case where the user has the Glob method defined in their VDL source.
	if gs := __ipc.NewGlobState(stub); gs != nil {
		stub.gs = gs
	} else if gs := __ipc.NewGlobState(impl); gs != nil {
		stub.gs = gs
	}
	return stub
}

type implSmokeDetectorServerStub struct {
	impl SmokeDetectorServerMethods
	gs   *__ipc.GlobState
}

func (s implSmokeDetectorServerStub) Status(ctx __ipc.ServerContext) (string, int16, error) {
	return s.impl.Status(ctx)
}

func (s implSmokeDetectorServerStub) Test(ctx __ipc.ServerContext) (bool, error) {
	return s.impl.Test(ctx)
}

func (s implSmokeDetectorServerStub) Sensitivity(ctx __ipc.ServerContext, i0 int16) error {
	return s.impl.Sensitivity(ctx, i0)
}

func (s implSmokeDetectorServerStub) VGlob() *__ipc.GlobState {
	return s.gs
}

func (s implSmokeDetectorServerStub) GetMethodTags(ctx __ipc.ServerContext, method string) ([]interface{}, error) {
	// TODO(toddw): Replace with new DescribeInterfaces implementation.
	switch method {
	case "Status":
		return []interface{}{}, nil
	case "Test":
		return []interface{}{}, nil
	case "Sensitivity":
		return []interface{}{}, nil
	default:
		return nil, nil
	}
}

func (s implSmokeDetectorServerStub) Signature(ctx __ipc.ServerContext) (__ipc.ServiceSignature, error) {
	// TODO(toddw) Replace with new DescribeInterfaces implementation.
	result := __ipc.ServiceSignature{Methods: make(map[string]__ipc.MethodSignature)}
	result.Methods["Sensitivity"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{
			{Name: "sens", Type: 35},
		},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["Status"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "status", Type: 3},
			{Name: "sensitivity", Type: 35},
			{Name: "err", Type: 65},
		},
	}
	result.Methods["Test"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 2},
			{Name: "", Type: 65},
		},
	}

	result.TypeDefs = []__vdlutil.Any{
		__wiretype.NamedPrimitiveType{Type: 0x1, Name: "error", Tags: []string(nil)}}

	return result, nil
}
