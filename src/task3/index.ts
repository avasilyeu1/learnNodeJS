import fetch, { Response } from "node-fetch";
import { EventEmitter } from "stream";

class MyEventEmitter {
  public listener: EventEmitter

  constructor() {
    this.listener = new EventEmitter()
  }

  addListener<T = void>(eventName: string | symbol, fn: (...args: any) => T) {
    this.listener.addListener(eventName, fn)
  }

  on<T = void>(eventName: string | symbol, fn: (...args: any) => T) {
    this.listener.on(eventName, fn)
  }

  removeListener<T = void>(eventName: string | symbol, fn: (...args: any) => T) {
    this.listener.removeListener(eventName, fn)
  }

  off<T>(eventName: string | symbol, fn: (...args: any) => T) {
    this.listener.off(eventName, fn)
  }

  once<T>(eventName: string | symbol, fn: (...args: any) => T) {
    this.listener.once(eventName, fn)
  }

  emit(eventName: string | symbol, ...args: any) {
    this.listener.emit(eventName, ...args)
  }

  listenerCount(eventName: string | symbol): number {
    return this.listener.listenerCount(eventName)
  }

  rawListeners(eventName: string | symbol): Function[] {
    return this.listener.rawListeners(eventName)
  }
}

class WithTime extends MyEventEmitter {
  async execute<T>(asyncFunc: (...args: any) => Promise<any>, ...args: any): Promise<T> {
    this.emit('begin')
    const response = await asyncFunc(...args)
    console.log(response)
    this.emit('end')
    return response
  }
}

const withTime = new WithTime();

withTime.on('begin', () => console.log('About to execute'));
withTime.on('end', () => console.log('Done with execute'));

console.log(withTime.rawListeners("end"));
const response = withTime.execute<Response>(fetch, 'https://jsonplaceholder.typicode.com/posts/1')


const myEmitter = new MyEventEmitter();

function c1() {
  console.log('an event occurred!');
}

function c2() {
  console.log('yet another event occurred!');
}

myEmitter.on('eventOne', c1); // Register for eventOne
myEmitter.on('eventOne', c2); // Register for eventOne

// Register eventOnce for one time execution
myEmitter.once('eventOnce', () => console.log('eventOnce once fired'));
myEmitter.once('init', () => console.log('init once fired'));

// Register for 'status' event with parameters
myEmitter.on('status', (code, msg) => console.log(`Got ${code} and ${msg}`));


myEmitter.emit('eventOne');

// Emit 'eventOnce' -> After this the eventOnce will be
// removed/unregistered automatically
myEmitter.emit('eventOnce');


myEmitter.emit('eventOne');
myEmitter.emit('init');
myEmitter.emit('init'); // Will not be fired
myEmitter.emit('eventOne');
myEmitter.emit('status', 200, 'ok');

// Get listener's count
console.log(myEmitter.listenerCount('eventOne'));

// Get array of rawListeners//
// Event registered with 'once()' will not be available here after the
// emit has been called
console.log(myEmitter.rawListeners('eventOne'));

// Get listener's count after remove one or all listeners of 'eventOne'
myEmitter.off('eventOne', c1);
console.log(myEmitter.listenerCount('eventOne'));
myEmitter.off('eventOne', c2);
console.log(myEmitter.listenerCount('eventOne'));