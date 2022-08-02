// obtained from https://javascript.plainenglish.io/web-worker-in-react-9b2efafe309c
export default class WorkerBuilder extends Worker {
  constructor(worker) {
    const code = worker.toString();
    const blob = new Blob([`(${code})()`]);
    return new Worker(URL.createObjectURL(blob));
  }
}
