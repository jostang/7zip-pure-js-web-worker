const SevenZip = {
    path: (function () {
        var scripts = document.getElementsByTagName("script");
        const currentSrc = scripts[scripts.length-1].src;
        return currentSrc.substr(0, currentSrc.lastIndexOf('/'));
    })(),
    WrongPasswordError: function WrongPasswordError () {
        this.name = 'WrongPasswordError';
        this.message = 'Wrong password';
        this.stack = (new Error()).stack;
    },
    decompress: function (file, password) {
        if (file) {
            return SevenZip.readFileAsByteArray(file).then(function (byteArray) {

                return new Promise(function (resolve, reject) {
                    try {
                        const worker = new Worker(SevenZip.path + '/worker.7z.wrapper.js');

                        worker.onerror = reject;

                        worker.onmessage = function (event) {
                            try {
                                switch (event.data.type) {
                                    case 2:
                                        if (event.data.text && event.data.text.startsWith('ERROR: Wrong password :')) {
                                            worker.terminate(); // release memory
                                            reject(new SevenZip.WrongPasswordError());
                                        }
                                        break;

                                    case 3:
                                        worker.terminate(); // release memory

                                        const files = event.data.results.map(function (rawFile) {
                                            return new File([rawFile.data], rawFile.path.substr(rawFile.path.lastIndexOf('/') + 1));
                                        });

                                        resolve(files);
                                        break;
                                }
                            } catch (error) {
                                reject(error);
                            }
                        };

                        const fileData = {
                            path: 'file',
                            isdir: false,
                            data: byteArray
                        };

                        const args = ['x', fileData.path, '-o/result'];

                        if (password) {
                            args.push('-p' + password);
                        }

                        worker.postMessage({
                            id: 1,
                            action: 'doit',
                            arguments: args,
                            totalMemory: 268435456,
                            FilesDataArray: [fileData]
                        });
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        }
    },
    readFileAsByteArray: function (file) {
        if (!file) {
            return false;
        }

        return new Promise(function (resolve, reject) {
            var fileReader = new FileReader();
            fileReader.onload = function (e) {
                resolve(new Uint8Array(e.target.result));
            };
            fileReader.readAsArrayBuffer(file);
        });
    }
};

SevenZip.WrongPasswordError.prototype = new Error;
