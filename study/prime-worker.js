const {isMainThread, Worker, parentPort, workerData} = require('worker_threads');

const min = 2;
let primes = [];

function findPrimes(start, range) {
    let isPrime = true;
    const end = start + range;
    for (let i = start; i < end; i++) {
        for (let j = min; j < Math.sqrt(end); j++) {
            if (i !== j && i % j === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) primes.push(i);
        isPrime = true;
    }
}


if (isMainThread) {
    const max = 10_000_000;
    const threadCount = 8; //worker_thread 8개 생성
    const threads = new Set();
    const range = Math.ceil((max - min) / threadCount); //worker_thread 에게 분배할 범위
    let start = min;

    console.time('prime');

    //worker_thread 에게 각각 task 분배
    for (let i = 0; i < threadCount - 1; i++) {
        const wStart = start;
        threads.add(new Worker(__filename, {workerData: {start: wStart, range}}));
        start += range;
    }
    threads.add(new Worker(__filename, {workerData: {start, range: range + ((max - min + 1) % threadCount)}}));

    for (let worker of threads) { //이벤트 핸들러 처리
        worker.on('error', (err) => { //에러처리
            throw err;
        });

        worker.on('exit', () => {
            threads.delete(worker); //작업이 끝나면 worker_thread 하나 삭제
            if (threads.size === 0) {
                console.timeEnd('prime');
                console.log(primes.length);
            }
        })

        worker.on('message', (msg) => { //작업 끝나면 합쳐주기
            primes = primes.concat(msg);
        })
    }
} else { //분배가 완료되었으면
    findPrimes(workerData.start, workerData.range);
    parentPort.postMessage(primes);
}