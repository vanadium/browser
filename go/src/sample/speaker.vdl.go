// This file was auto-generated by the veyron vdl tool.
// Source: speaker.vdl

package sample

import (
	// The non-user imports are prefixed with "__" to prevent collisions.
	__io "io"
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

// SpeakerClientMethods is the client interface
// containing Speaker methods.
//
// Speaker allows clients to control the music being played.
type SpeakerClientMethods interface {
	// Play starts or continues the current song.
	Play(__context.T, ...__ipc.CallOpt) error
	// PlaySong plays back the given song title, if possible.
	PlaySong(ctx __context.T, songName string, opts ...__ipc.CallOpt) error
	// PlayStream plays the given stream of music data.
	PlayStream(__context.T, ...__ipc.CallOpt) (SpeakerPlayStreamCall, error)
	// GetSong retrieves the title of the Speaker's current song, if any.
	GetSong(__context.T, ...__ipc.CallOpt) (string, error)
	// Pause playback of the Speaker's current song.
	Pause(__context.T, ...__ipc.CallOpt) error
	// Stop playback of the Speaker's current song.
	Stop(__context.T, ...__ipc.CallOpt) error
	// Volume adjusts the Speaker's volume.
	Volume(ctx __context.T, volumeLevel uint16, opts ...__ipc.CallOpt) error
	// GetVolume retrieves the Speaker's volume.
	GetVolume(__context.T, ...__ipc.CallOpt) (uint16, error)
	// AddSongs adds the list of given songs to the song library.
	AddSongs(ctx __context.T, songs []string, opts ...__ipc.CallOpt) error
	// RemoveSongs removes the list of given songs from the song library.
	RemoveSongs(ctx __context.T, songs []string, opts ...__ipc.CallOpt) error
}

// SpeakerClientStub adds universal methods to SpeakerClientMethods.
type SpeakerClientStub interface {
	SpeakerClientMethods
	__ipc.UniversalServiceMethods
}

// SpeakerClient returns a client stub for Speaker.
func SpeakerClient(name string, opts ...__ipc.BindOpt) SpeakerClientStub {
	var client __ipc.Client
	for _, opt := range opts {
		if clientOpt, ok := opt.(__ipc.Client); ok {
			client = clientOpt
		}
	}
	return implSpeakerClientStub{name, client}
}

type implSpeakerClientStub struct {
	name   string
	client __ipc.Client
}

func (c implSpeakerClientStub) c(ctx __context.T) __ipc.Client {
	if c.client != nil {
		return c.client
	}
	return __veyron2.RuntimeFromContext(ctx).Client()
}

func (c implSpeakerClientStub) Play(ctx __context.T, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Play", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) PlaySong(ctx __context.T, i0 string, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "PlaySong", []interface{}{i0}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) PlayStream(ctx __context.T, opts ...__ipc.CallOpt) (ocall SpeakerPlayStreamCall, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "PlayStream", nil, opts...); err != nil {
		return
	}
	ocall = &implSpeakerPlayStreamCall{Call: call}
	return
}

func (c implSpeakerClientStub) GetSong(ctx __context.T, opts ...__ipc.CallOpt) (o0 string, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "GetSong", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) Pause(ctx __context.T, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Pause", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) Stop(ctx __context.T, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Stop", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) Volume(ctx __context.T, i0 uint16, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Volume", []interface{}{i0}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) GetVolume(ctx __context.T, opts ...__ipc.CallOpt) (o0 uint16, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "GetVolume", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) AddSongs(ctx __context.T, i0 []string, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "AddSongs", []interface{}{i0}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) RemoveSongs(ctx __context.T, i0 []string, opts ...__ipc.CallOpt) (err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "RemoveSongs", []interface{}{i0}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) Signature(ctx __context.T, opts ...__ipc.CallOpt) (o0 __ipc.ServiceSignature, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "Signature", nil, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

func (c implSpeakerClientStub) GetMethodTags(ctx __context.T, method string, opts ...__ipc.CallOpt) (o0 []interface{}, err error) {
	var call __ipc.Call
	if call, err = c.c(ctx).StartCall(ctx, c.name, "GetMethodTags", []interface{}{method}, opts...); err != nil {
		return
	}
	if ierr := call.Finish(&o0, &err); ierr != nil {
		err = ierr
	}
	return
}

// SpeakerPlayStreamClientStream is the client stream for Speaker.PlayStream.
type SpeakerPlayStreamClientStream interface {
	// SendStream returns the send side of the Speaker.PlayStream client stream.
	SendStream() interface {
		// Send places the item onto the output stream.  Returns errors encountered
		// while sending, or if Send is called after Close or Cancel.  Blocks if
		// there is no buffer space; will unblock when buffer space is available or
		// after Cancel.
		Send(item []byte) error
		// Close indicates to the server that no more items will be sent; server
		// Recv calls will receive io.EOF after all sent items.  This is an optional
		// call - e.g. a client might call Close if it needs to continue receiving
		// items from the server after it's done sending.  Returns errors
		// encountered while closing, or if Close is called after Cancel.  Like
		// Send, blocks if there is no buffer space available.
		Close() error
	}
}

// SpeakerPlayStreamCall represents the call returned from Speaker.PlayStream.
type SpeakerPlayStreamCall interface {
	SpeakerPlayStreamClientStream
	// Finish performs the equivalent of SendStream().Close, then blocks until
	// the server is done, and returns the positional return values for the call.
	//
	// Finish returns immediately if Cancel has been called; depending on the
	// timing the output could either be an error signaling cancelation, or the
	// valid positional return values from the server.
	//
	// Calling Finish is mandatory for releasing stream resources, unless Cancel
	// has been called or any of the other methods return an error.  Finish should
	// be called at most once.
	Finish() error
	// Cancel cancels the RPC, notifying the server to stop processing.  It is
	// safe to call Cancel concurrently with any of the other stream methods.
	// Calling Cancel after Finish has returned is a no-op.
	Cancel()
}

type implSpeakerPlayStreamCall struct {
	__ipc.Call
}

func (c *implSpeakerPlayStreamCall) SendStream() interface {
	Send(item []byte) error
	Close() error
} {
	return implSpeakerPlayStreamCallSend{c}
}

type implSpeakerPlayStreamCallSend struct {
	c *implSpeakerPlayStreamCall
}

func (c implSpeakerPlayStreamCallSend) Send(item []byte) error {
	return c.c.Send(item)
}
func (c implSpeakerPlayStreamCallSend) Close() error {
	return c.c.CloseSend()
}
func (c *implSpeakerPlayStreamCall) Finish() (err error) {
	if ierr := c.Call.Finish(&err); ierr != nil {
		err = ierr
	}
	return
}

// SpeakerServerMethods is the interface a server writer
// implements for Speaker.
//
// Speaker allows clients to control the music being played.
type SpeakerServerMethods interface {
	// Play starts or continues the current song.
	Play(__ipc.ServerContext) error
	// PlaySong plays back the given song title, if possible.
	PlaySong(ctx __ipc.ServerContext, songName string) error
	// PlayStream plays the given stream of music data.
	PlayStream(SpeakerPlayStreamContext) error
	// GetSong retrieves the title of the Speaker's current song, if any.
	GetSong(__ipc.ServerContext) (string, error)
	// Pause playback of the Speaker's current song.
	Pause(__ipc.ServerContext) error
	// Stop playback of the Speaker's current song.
	Stop(__ipc.ServerContext) error
	// Volume adjusts the Speaker's volume.
	Volume(ctx __ipc.ServerContext, volumeLevel uint16) error
	// GetVolume retrieves the Speaker's volume.
	GetVolume(__ipc.ServerContext) (uint16, error)
	// AddSongs adds the list of given songs to the song library.
	AddSongs(ctx __ipc.ServerContext, songs []string) error
	// RemoveSongs removes the list of given songs from the song library.
	RemoveSongs(ctx __ipc.ServerContext, songs []string) error
}

// SpeakerServerStubMethods is the server interface containing
// Speaker methods, as expected by ipc.Server.
// The only difference between this interface and SpeakerServerMethods
// is the streaming methods.
type SpeakerServerStubMethods interface {
	// Play starts or continues the current song.
	Play(__ipc.ServerContext) error
	// PlaySong plays back the given song title, if possible.
	PlaySong(ctx __ipc.ServerContext, songName string) error
	// PlayStream plays the given stream of music data.
	PlayStream(*SpeakerPlayStreamContextStub) error
	// GetSong retrieves the title of the Speaker's current song, if any.
	GetSong(__ipc.ServerContext) (string, error)
	// Pause playback of the Speaker's current song.
	Pause(__ipc.ServerContext) error
	// Stop playback of the Speaker's current song.
	Stop(__ipc.ServerContext) error
	// Volume adjusts the Speaker's volume.
	Volume(ctx __ipc.ServerContext, volumeLevel uint16) error
	// GetVolume retrieves the Speaker's volume.
	GetVolume(__ipc.ServerContext) (uint16, error)
	// AddSongs adds the list of given songs to the song library.
	AddSongs(ctx __ipc.ServerContext, songs []string) error
	// RemoveSongs removes the list of given songs from the song library.
	RemoveSongs(ctx __ipc.ServerContext, songs []string) error
}

// SpeakerServerStub adds universal methods to SpeakerServerStubMethods.
type SpeakerServerStub interface {
	SpeakerServerStubMethods
	// GetMethodTags will be replaced with DescribeInterfaces.
	GetMethodTags(ctx __ipc.ServerContext, method string) ([]interface{}, error)
	// Signature will be replaced with DescribeInterfaces.
	Signature(ctx __ipc.ServerContext) (__ipc.ServiceSignature, error)
}

// SpeakerServer returns a server stub for Speaker.
// It converts an implementation of SpeakerServerMethods into
// an object that may be used by ipc.Server.
func SpeakerServer(impl SpeakerServerMethods) SpeakerServerStub {
	stub := implSpeakerServerStub{
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

type implSpeakerServerStub struct {
	impl SpeakerServerMethods
	gs   *__ipc.GlobState
}

func (s implSpeakerServerStub) Play(ctx __ipc.ServerContext) error {
	return s.impl.Play(ctx)
}

func (s implSpeakerServerStub) PlaySong(ctx __ipc.ServerContext, i0 string) error {
	return s.impl.PlaySong(ctx, i0)
}

func (s implSpeakerServerStub) PlayStream(ctx *SpeakerPlayStreamContextStub) error {
	return s.impl.PlayStream(ctx)
}

func (s implSpeakerServerStub) GetSong(ctx __ipc.ServerContext) (string, error) {
	return s.impl.GetSong(ctx)
}

func (s implSpeakerServerStub) Pause(ctx __ipc.ServerContext) error {
	return s.impl.Pause(ctx)
}

func (s implSpeakerServerStub) Stop(ctx __ipc.ServerContext) error {
	return s.impl.Stop(ctx)
}

func (s implSpeakerServerStub) Volume(ctx __ipc.ServerContext, i0 uint16) error {
	return s.impl.Volume(ctx, i0)
}

func (s implSpeakerServerStub) GetVolume(ctx __ipc.ServerContext) (uint16, error) {
	return s.impl.GetVolume(ctx)
}

func (s implSpeakerServerStub) AddSongs(ctx __ipc.ServerContext, i0 []string) error {
	return s.impl.AddSongs(ctx, i0)
}

func (s implSpeakerServerStub) RemoveSongs(ctx __ipc.ServerContext, i0 []string) error {
	return s.impl.RemoveSongs(ctx, i0)
}

func (s implSpeakerServerStub) VGlob() *__ipc.GlobState {
	return s.gs
}

func (s implSpeakerServerStub) GetMethodTags(ctx __ipc.ServerContext, method string) ([]interface{}, error) {
	// TODO(toddw): Replace with new DescribeInterfaces implementation.
	switch method {
	case "Play":
		return []interface{}{}, nil
	case "PlaySong":
		return []interface{}{}, nil
	case "PlayStream":
		return []interface{}{}, nil
	case "GetSong":
		return []interface{}{}, nil
	case "Pause":
		return []interface{}{}, nil
	case "Stop":
		return []interface{}{}, nil
	case "Volume":
		return []interface{}{}, nil
	case "GetVolume":
		return []interface{}{}, nil
	case "AddSongs":
		return []interface{}{}, nil
	case "RemoveSongs":
		return []interface{}{}, nil
	default:
		return nil, nil
	}
}

func (s implSpeakerServerStub) Signature(ctx __ipc.ServerContext) (__ipc.ServiceSignature, error) {
	// TODO(toddw) Replace with new DescribeInterfaces implementation.
	result := __ipc.ServiceSignature{Methods: make(map[string]__ipc.MethodSignature)}
	result.Methods["AddSongs"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{
			{Name: "songs", Type: 61},
		},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["GetSong"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 3},
			{Name: "", Type: 65},
		},
	}
	result.Methods["GetVolume"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 51},
			{Name: "", Type: 65},
		},
	}
	result.Methods["Pause"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["Play"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["PlaySong"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{
			{Name: "songName", Type: 3},
		},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["PlayStream"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
		InStream: 67,
	}
	result.Methods["RemoveSongs"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{
			{Name: "songs", Type: 61},
		},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["Stop"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}
	result.Methods["Volume"] = __ipc.MethodSignature{
		InArgs: []__ipc.MethodArgument{
			{Name: "volumeLevel", Type: 51},
		},
		OutArgs: []__ipc.MethodArgument{
			{Name: "", Type: 65},
		},
	}

	result.TypeDefs = []__vdlutil.Any{
		__wiretype.NamedPrimitiveType{Type: 0x1, Name: "error", Tags: []string(nil)}, __wiretype.NamedPrimitiveType{Type: 0x32, Name: "byte", Tags: []string(nil)}, __wiretype.SliceType{Elem: 0x42, Name: "", Tags: []string(nil)}}

	return result, nil
}

// SpeakerPlayStreamServerStream is the server stream for Speaker.PlayStream.
type SpeakerPlayStreamServerStream interface {
	// RecvStream returns the receiver side of the Speaker.PlayStream server stream.
	RecvStream() interface {
		// Advance stages an item so that it may be retrieved via Value.  Returns
		// true iff there is an item to retrieve.  Advance must be called before
		// Value is called.  May block if an item is not available.
		Advance() bool
		// Value returns the item that was staged by Advance.  May panic if Advance
		// returned false or was not called.  Never blocks.
		Value() []byte
		// Err returns any error encountered by Advance.  Never blocks.
		Err() error
	}
}

// SpeakerPlayStreamContext represents the context passed to Speaker.PlayStream.
type SpeakerPlayStreamContext interface {
	__ipc.ServerContext
	SpeakerPlayStreamServerStream
}

// SpeakerPlayStreamContextStub is a wrapper that converts ipc.ServerCall into
// a typesafe stub that implements SpeakerPlayStreamContext.
type SpeakerPlayStreamContextStub struct {
	__ipc.ServerCall
	valRecv []byte
	errRecv error
}

// Init initializes SpeakerPlayStreamContextStub from ipc.ServerCall.
func (s *SpeakerPlayStreamContextStub) Init(call __ipc.ServerCall) {
	s.ServerCall = call
}

// RecvStream returns the receiver side of the Speaker.PlayStream server stream.
func (s *SpeakerPlayStreamContextStub) RecvStream() interface {
	Advance() bool
	Value() []byte
	Err() error
} {
	return implSpeakerPlayStreamContextRecv{s}
}

type implSpeakerPlayStreamContextRecv struct {
	s *SpeakerPlayStreamContextStub
}

func (s implSpeakerPlayStreamContextRecv) Advance() bool {
	s.s.errRecv = s.s.Recv(&s.s.valRecv)
	return s.s.errRecv == nil
}
func (s implSpeakerPlayStreamContextRecv) Value() []byte {
	return s.s.valRecv
}
func (s implSpeakerPlayStreamContextRecv) Err() error {
	if s.s.errRecv == __io.EOF {
		return nil
	}
	return s.s.errRecv
}
