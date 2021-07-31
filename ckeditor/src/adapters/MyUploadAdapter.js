
class MyUploadAdapter {
	constructor(loader) {
		this.loader = loader;
	}

	// Starts the upload process.
	upload() {
            return new Promise((resolve, reject) => {
            const data = new FormData();
            data.append('upload', this.loader.file);
            data.append('allowSize', 10);//允许图片上传的大小/兆
            $.ajax({
                url: '/media/uploads/',
                type: 'POST',
                data: data,
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function (data) {
                    if (data.res) {
                        resolve({
                            default: data.url
                        });
                    } else {
                        reject(data.msg);
                    }

                }
            });

        });
	}

	// Aborts the upload process.
	abort(){
		if (this.xhr){
			this.xhr.abort();
		}
	}

	// Initializes the XMLHttpRequest object using the URL passed to the constructor.
	_initRequest(){
		const xhr = this.xhr = new XMLHttpRequest();
		xhr.open('POST', 'http://8.210.190.114:8000/media/uploads/', true)
		xhr.responseType='json';
	}

	// Initializes XMLHttpRequest listeners.
	_initListeners(resolve, reject, file){
		const xhr = this.xhr;
		const loader = this.loader;
		const genericErrorText = "Couldn`t upload file: ${file.name}.";

		xhr.addEventListener('error',() => reject( genericErrorText ));
		xhr.addEventListener('abort',() => reject());
		xhr.addEventListener( 'load', () => {
			const response = xhr.response;

			if ( !response || response.error ) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }

			resolve( {
                default: response.url
            } );

		});

		if ( xhr.upload ) {
            xhr.upload.addEventListener( 'progress', evt => {
                if ( evt.lengthComputable ) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            } );
        }
	}

	_sendRequest( file ) {
        // Prepare the form data.
        const data = new FormData();

        data.append( 'upload', file );

        // Important note: This is the right place to implement security mechanisms
        // like authentication and CSRF protection. For instance, you can use
        // XMLHttpRequest.setRequestHeader() to set the request headers containing
        // the CSRF token generated earlier by your application.

        // Send the request.
        this.xhr.send( data );
    }
	//global end
}


function MyCustomUploadAdapterPlugin( editor ) {
    editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
        // Configure the URL to the upload script in your back-end here!
        return new MyUploadAdapter( loader );
    };
}
