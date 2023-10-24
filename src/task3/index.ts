import fetch, { Response } from "node-fetch";
import csvtojson from "csvtojson";
import fs from 'fs'

type Function = <T>(...args: any) => T | void
type Listener = {
  name: string,
  fn: Function,
  isOnce: boolean,
}

class MyEventEmitter {
  public listeners: Listener[] = []

  addListener(eventName: string, fn: Function, isOnce?: boolean) {
    this.listeners.push({
      name: eventName,
      fn,
      isOnce: isOnce ?? false
    })
  }

  on(eventName: string, fn: Function) {
    this.addListener(eventName, fn)
  }

  removeListener(eventName: string, fn: Function) {
    this.listeners = this.listeners.filter(listener => listener.name !== eventName || listener.fn !== fn);
  }

  off(eventName: string, fn: Function) {
    this.removeListener(eventName, fn)
  }

  once(eventName: string, fn: Function) {
    this.addListener(eventName, fn, true)
  }

  emit(eventName: string, ...args: any) {
    this.listeners.forEach(listener => {
      if (listener.name === eventName) {
        listener.fn(...args)

        if (listener.isOnce)
          this.removeListener(eventName, listener.fn)
      }
    })
  }

  listenerCount(eventName: string | symbol): number {
    return this.listeners.filter(listener => listener.name === eventName).length
  }

  rawListeners(eventName: string | symbol): Function[] {
    return this.listeners.filter(listener => listener.name === eventName).map(listener => listener.fn)
  }
}

class WithTime extends MyEventEmitter {
  async execute<T>(asyncFunc: (...args: any) => Promise<any>, ...args: any): Promise<T | void> {
    this.emit('begin')
    const startTime = new Date().getTime()
    const response = await asyncFunc(...args)
    const endTime = new Date().getTime()

    this.emit('end', endTime - startTime)
    this.emit('executed', response)
  }
}

const withTime = new WithTime();

withTime.on('begin', () => console.log('About to execute'));
withTime.on('end', (timeMS) => console.log(`Done with execute, it took ${timeMS}ms`));

console.log(withTime.rawListeners("end"));
withTime.on('executed', (response) => console.log(response))
withTime.execute<Response>(fetch, 'https://jsonplaceholder.typicode.com/posts/1')


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

interface CSVItemType {
  Book: string;
  Author: string;
  Amount: string;
  Price: string;
}
interface JSONItemType {
  book: string;
  author: string;
  price: string
}
const writableStream = fs.createWriteStream(`${__dirname}/csv//nodejs-hw1-ex2.txt`)
writableStream.on('error', (error) => {
  console.log(error);
})


csvtojson()
  .fromFile(`${__dirname}/csv/nodejs-hw1-ex1.csv`)
  .subscribe((data: CSVItemType) => {
    return new Promise((resolve) => {
      const nextJSONValue: JSONItemType = {
        book: data.Book,
        author: data.Author,
        price: data.Price
      }
      writableStream.write(`${JSON.stringify(nextJSONValue)}\n`)
      resolve()
    })
  }, error => console.log(`Load error: `, error), () => {
    writableStream.end()
  })